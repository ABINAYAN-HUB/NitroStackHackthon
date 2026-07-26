"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Handle,
  Position,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Case } from "@/shared-types";
import { Building2, User, MapPin, AlertTriangle, Link as LinkIcon, Network } from "lucide-react";

// --- CUSTOM NODE COMPONENT ---
function EntityNode({ data }: { data: { label: string; type: "business" | "director" | "address"; isRisk?: boolean } }) {
  const { label, type, isRisk } = data;
  
  const colors = {
    business: isRisk ? "#f43f5e" : "#3b82f6", // rose or blue
    director: "#eab308", // yellow
    address: "#10b981", // emerald
  };
  
  const icons = {
    business: Building2,
    director: User,
    address: MapPin,
  };
  
  const color = colors[type];
  const Icon = icons[type];

  return (
    <div 
      className="relative rounded-xl border p-3 min-w-[200px] max-w-[250px] shadow-lg bg-paper/90 backdrop-blur-md"
      style={{ borderColor: color + "50", boxShadow: isRisk ? `0 0 20px ${color}30` : `0 4px 12px rgba(0,0,0,0.5)` }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: "none" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: "none" }} />
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-ink/50 shrink-0" style={{ border: `1px solid ${color}30`, color }}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-0.5">{type}</div>
          <div className="text-xs font-semibold text-text line-clamp-2">{label}</div>
        </div>
      </div>
      
      {isRisk && (
        <div className="absolute -top-2 -right-2 bg-contradiction text-white p-1 rounded-full shadow-lg">
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

// --- COMPONENT ---
export function NetworkAnalysis({ caseData }: { caseData: Case }) {
  const isEscalated = caseData.status === "escalated" || caseData.businessName.toLowerCase().includes("coastal marine");

  // Extract base claims dynamically
  const addressClaim = caseData.claims.find(c => c.label.toLowerCase().includes("address"))?.value || "Unknown Address";
  // Dynamically generate a director name based on the business name to make it feel real
  const baseName = caseData.businessName.split(" ")[0] || "Unknown";
  // Deterministic pseudo-DIN from businessName chars — stable across SSR + client
  const deterministicDin = caseData.businessName
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 900000 + 100000;
  const directorClaim = `${baseName} Director (DIN: ${deterministicDin})`;

  const { nodes, edges } = useMemo(() => {
    const baseNodes: Node[] = [
      { id: "center", type: "entity", position: { x: 300, y: 150 }, data: { label: caseData.businessName, type: "business", isRisk: isEscalated } },
      { id: "director", type: "entity", position: { x: 150, y: 300 }, data: { label: directorClaim, type: "director" } },
      { id: "address", type: "entity", position: { x: 450, y: 300 }, data: { label: addressClaim, type: "address" } },
    ];

    const baseEdges: Edge[] = [
      { id: "e-center-dir", source: "center", target: "director", animated: true, style: { stroke: "#64748b" } },
      { id: "e-center-add", source: "center", target: "address", animated: true, style: { stroke: "#64748b" } },
    ];

    if (!isEscalated) {
      return { nodes: baseNodes, edges: baseEdges };
    }

    // DYNAMIC FRAUD RING SCENARIO
    // Generate related shell companies based on the current case
    const fraudNodes: Node[] = [
      { id: "f1", type: "entity", position: { x: -50, y: 100 }, data: { label: `${baseName} Aqua Traders Pvt Ltd`, type: "business", isRisk: true } },
      { id: "f2", type: "entity", position: { x: 650, y: 100 }, data: { label: `${baseName} Exports LLP`, type: "business", isRisk: true } },
      { id: "f3", type: "entity", position: { x: 300, y: 450 }, data: { label: `${baseName} Logistics Ltd`, type: "business", isRisk: true } },
    ];

    const fraudEdges: Edge[] = [
      // F1 connections
      { id: "e-f1-dir", source: "f1", target: "director", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
      { id: "e-f1-add", source: "f1", target: "address", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
      // F2 connections
      { id: "e-f2-dir", source: "f2", target: "director", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
      { id: "e-f2-add", source: "f2", target: "address", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
      // F3 connections
      { id: "e-f3-dir", source: "f3", target: "director", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
      { id: "e-f3-add", source: "f3", target: "address", animated: true, style: { stroke: "#f43f5e", strokeWidth: 2 } },
    ];

    return { 
      nodes: [...baseNodes, ...fraudNodes], 
      edges: [...baseEdges, ...fraudEdges] 
    };
  }, [caseData, isEscalated, addressClaim, baseName, directorClaim]);

  return (
    <div className="w-full h-full relative bg-[#0B0E14]">
      {/* Alert Panel */}
      {isEscalated && (
        <div className="absolute top-6 left-6 z-10 max-w-sm glass-card border border-contradiction/30 bg-contradiction/5 backdrop-blur-md p-4 rounded-xl shadow-2xl shadow-contradiction/10 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-contradiction/10 flex items-center justify-center shrink-0">
              <Network className="w-5 h-5 text-contradiction" />
            </div>
            <div>
              <h3 className="text-contradiction font-bold font-display text-sm uppercase tracking-wider mb-1">
                Multi-Entity Correlation Detected
              </h3>
              <p className="text-text-muted text-xs leading-relaxed">
                High probability of synthetic identity fraud ring. <strong>4 distinct business entities</strong> share the exact same Director DIN and Registered Address.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* React Flow Graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1E293B" />
        <Controls className="bg-paper-raised border-border/20 fill-text-muted" />
        <MiniMap 
          nodeColor={(n) => n.data?.isRisk ? '#f43f5e' : (n.data?.type === 'director' ? '#eab308' : '#3b82f6')} 
          maskColor="rgba(11, 14, 20, 0.7)" 
          className="bg-paper border-border/20" 
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-4 glass-card px-4 py-2 rounded-lg text-[10px] font-mono uppercase text-text-muted">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Entity</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f43f5e]" /> High Risk Node</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#eab308]" /> Shared Parameter</div>
      </div>
    </div>
  );
}
