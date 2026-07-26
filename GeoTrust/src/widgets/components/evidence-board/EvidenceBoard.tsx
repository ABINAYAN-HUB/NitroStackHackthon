"use client";

import { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Case, Claim, Evidence, Dimension } from "@/shared-types";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { dimensionLabel, cn } from "@/lib/utils";
import { User, MapPin, Globe, FileCheck } from "lucide-react";

const DIMENSION_COLORS: Record<Dimension, string> = {
  identity: "#3FA88A",
  location: "#D69A4E",
  digital_presence: "#7B8AE0",
  document_integrity: "#C1544A",
};

const DIM_ICONS: Record<Dimension, React.FC<{ className?: string }>> = {
  identity: ({ className }) => <User className={className} />,
  location: ({ className }) => <MapPin className={className} />,
  digital_presence: ({ className }) => <Globe className={className} />,
  document_integrity: ({ className }) => <FileCheck className={className} />,
};

// Custom claim node
function ClaimNode({ data }: { data: { claim: Claim; dimColor: string } }) {
  const { claim, dimColor } = data;
  const statusColors = { verified: "var(--verified)", contradicted: "var(--contradiction)", pending: "var(--caution)" };
  const sc = statusColors[claim.status];
  const Icon = DIM_ICONS[claim.dimension];
  return (
    <div
      className="relative rounded-2xl border p-5 min-w-[260px] max-w-[300px] shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-paper/80 backdrop-blur-md group"
      style={{
        borderColor: dimColor + "40",
        boxShadow: `0 8px 32px -8px ${dimColor}30`,
      }}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80" style={{ background: `linear-gradient(90deg, ${dimColor}80, transparent)` }} />
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${dimColor}, transparent 70%)` }} />

      <Handle type="source" position={Position.Right} style={{ background: dimColor, border: "2px solid var(--paper)", width: 10, height: 10 }} />
      <Handle type="target" position={Position.Left} style={{ background: dimColor, border: "2px solid var(--paper)", width: 10, height: 10 }} />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-ink/50" style={{ border: `1px solid ${dimColor}30`, color: dimColor }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-normal" style={{ color: dimColor }}>
          {dimensionLabel(claim.dimension)}
        </span>
      </div>
      
      <div className="text-xs font-mono text-text-muted mb-2 uppercase tracking-normal">{claim.label}</div>
      <div className="text-sm font-body text-text font-medium leading-relaxed line-clamp-4 mb-5" title={claim.value}>{claim.value}</div>
      
      <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-auto">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-ink/40 border border-white/5">
          <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: sc, boxShadow: `0 0 8px ${sc}80` }} />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: sc }}>{claim.status}</span>
        </div>
      </div>
    </div>
  );
}

// Custom evidence node
function EvidenceNode({ data }: { data: { evidence: Evidence } }) {
  const { evidence } = data;
  const relColors = { supports: "var(--verified)", contradicts: "var(--contradiction)", missing: "var(--text-muted)" };
  const rc = relColors[evidence.relation];
  
  return (
    <div
      className="relative rounded-xl border p-4 max-w-[240px] shadow-lg transition-all duration-300 hover:scale-[1.02] bg-ink/80 backdrop-blur-sm group"
      style={{ borderColor: rc + "30" }}
    >
      {/* Left edge color strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-70" style={{ background: rc }} />

      <Handle type="source" position={Position.Right} style={{ background: rc, border: "2px solid var(--ink)", width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: rc, border: "2px solid var(--ink)", width: 8, height: 8 }} />
      
      <div className="pl-2">
        <div className="text-xs font-mono font-bold uppercase tracking-normal line-clamp-2 mb-2" style={{ color: rc }}>
          {evidence.source}
        </div>
        <div className="text-sm font-body text-text-secondary leading-relaxed line-clamp-4 mb-4">
          {evidence.snippet}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-paper rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${evidence.reliability * 100}%`, background: rc, opacity: 0.7 }} />
          </div>
          <div className="text-[9px] font-mono text-text-muted">
            {Math.round(evidence.reliability * 100)}% rel
          </div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { claim: ClaimNode, evidence: EvidenceNode };

function buildGraph(claims: Claim[], filterDim: Dimension | "all") {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const filtered = filterDim === "all" ? claims : claims.filter(c => c.dimension === filterDim);

  const dims = [...new Set(filtered.map(c => c.dimension))];
  // Track the actual vertical Y-offset for each dimension column
  const dimYOffsets: Record<string, number> = {};

  filtered.forEach((claim) => {
    const dimIdx = dims.indexOf(claim.dimension);
    
    // Spread out columns (dimensions) by 750px so Evidence nodes have plenty of space
    const x = dimIdx * 750;
    
    // Get the current Y offset for this dimension (start at 80)
    const currentY = dimYOffsets[claim.dimension] || 80;
    const y = currentY;
    
    // Calculate how much vertical space this claim + its evidence takes
    const evidenceSpace = claim.evidence.length * 320;
    const claimSpace = 200;
    const spaceRequired = Math.max(claimSpace, evidenceSpace) + 80; // 80px padding between clusters
    
    dimYOffsets[claim.dimension] = currentY + spaceRequired;
    
    const dimColor = DIMENSION_COLORS[claim.dimension];

    nodes.push({
      id: claim.id,
      type: "claim",
      position: { x, y },
      data: { claim, dimColor },
    });

    claim.evidence.forEach((ev, ei) => {
      const evId = `ev-${claim.id}-${ei}`;
      // Push evidence nodes to the right of the claim node
      const evX = x + (ev.relation === "contradicts" ? 380 : 360);
      
      // Space evidence nodes by 320px vertically to prevent text overlap for tall nodes
      const evY = y - 10 + ei * 320;

      nodes.push({
        id: evId,
        type: "evidence",
        position: { x: evX, y: evY },
        data: { evidence: ev },
      });

      const edgeStyle =
        ev.relation === "supports"
          ? { stroke: "var(--verified)", strokeWidth: 2 }
          : ev.relation === "contradicts"
            ? { stroke: "var(--contradiction)", strokeWidth: 2, strokeDasharray: "8 4" }
            : { stroke: "var(--border-light)", strokeWidth: 1.5, strokeDasharray: "4 4" };

      edges.push({
        id: `e-${claim.id}-${evId}`,
        source: claim.id,
        target: evId,
        style: edgeStyle,
        animated: ev.relation !== "missing",
      });
    });
  });

  return { nodes, edges };
}

export function EvidenceBoard({ caseData }: { caseData: Case }) {
  const [filterDim, setFilterDim] = useState<Dimension | "all">("all");
  const [selected, setSelected] = useState<{ type: "claim" | "evidence"; data: Claim | Evidence } | null>(null);

  const { nodes: filteredNodes, edges: filteredEdges } = useMemo(() => buildGraph(caseData.claims, filterDim), [caseData.claims, filterDim]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "claim") {
      setSelected({ type: "claim", data: node.data.claim as Claim });
    } else if (node.type === "evidence") {
      setSelected({ type: "evidence", data: node.data.evidence as Evidence });
    }
  }, []);

  if (caseData.status === "investigating" && caseData.claims.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-ink gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-line border-t-verified animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-verified" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-text mb-1">Building Evidence Board</p>
          <p className="text-text-muted text-sm font-mono">Investigation in progress — nodes populating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-paper no-print">
        <span className="text-xs font-mono text-text-muted mr-1">Filter:</span>
        {(["all", "identity", "location", "digital_presence", "document_integrity"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilterDim(d)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-mono transition-all",
              filterDim === d
                ? "text-text border border-border-light bg-paper-raised"
                : "text-text-muted hover:text-text"
            )}
            style={filterDim === d && d !== "all" ? { borderColor: DIMENSION_COLORS[d] + "66", color: DIMENSION_COLORS[d] } : {}}
          >
            {d === "all" ? "All" : dimensionLabel(d)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1">
            <div className="w-4 h-px bg-verified" />
            supports
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-px bg-contradiction" style={{ borderTop: "1px dashed #C1544A", height: 0 }} />
            contradicts
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-px bg-line" style={{ borderTop: "1px dotted #2A3038", height: 0 }} />
            missing
          </span>
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-mesh">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          style={{ background: "transparent" }}
          minZoom={0.3}
          maxZoom={2}
          panOnScroll={true}
        >
          <Background variant={BackgroundVariant.Dots} color="#2E4058" gap={20} size={1} />
          <Controls 
            className="border-none shadow-2xl rounded-xl overflow-hidden" 
            style={{ backgroundColor: "rgba(17, 24, 32, 0.8)", backdropFilter: "blur(12px)" }}
          />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === "claim") return DIMENSION_COLORS[(n.data as { claim: Claim }).claim.dimension];
              return "#2E4058";
            }}
            style={{ 
              width: 140,
              height: 100,
              backgroundColor: "rgba(17, 24, 32, 0.8)", 
              border: "1px solid rgba(46, 64, 88, 0.5)", 
              borderRadius: "12px", 
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)"
            }}
            maskColor="rgba(8, 11, 17, 0.8)"
          />
        </ReactFlow>

        {/* Node detail slide-over */}
        {selected && (
          <NodeDetailPanel
            selected={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
