"use client";

import { useState } from "react";
import type { Case } from "@/shared-types";
import { ChevronRight, Printer, Download, ArrowLeft, TerminalSquare, GitGraph, Network, ScanLine } from "lucide-react";
import { statusConfig, formatDate, cn } from "@/lib/utils";
import { ClaimsRail } from "@/components/case/ClaimsRail";
import { EvidenceBoard } from "@/components/evidence-board/EvidenceBoard";
import { McpConsole } from "@/components/mcp/McpConsole";
import { DimensionScoreCard } from "@/components/scoring/DimensionScoreCard";
import { RadialGauge } from "@/components/scoring/RadialGauge";
import { RecommendationBadge } from "@/components/scoring/RecommendationBadge";
import { InvestigationTrace } from "@/components/trace/InvestigationTrace";
import { ContradictionsStrip } from "@/components/contradictions/ContradictionsStrip";
import { MissingEvidenceChecklist } from "@/components/case/MissingEvidenceChecklist";
import MapContainer from "@/components/map/MapContainer";
import { NetworkAnalysis } from "@/components/evidence-board/NetworkAnalysis";
import { OcrViewer } from "@/components/documents/OcrViewer";

interface Props {
  caseData: Case;
}

export function CaseInvestigationView({ caseData }: Props) {
  const [activeTab, setActiveTab] = useState<"board" | "network" | "ocr" | "mcp">("board");
  const sc = statusConfig(caseData.status);
  const isInvestigating = caseData.status === "investigating";
  const contradictions = caseData.claims.filter((c) => c.status === "contradicted");
  const addressClaim = caseData.claims.find(c => c.label.toLowerCase().includes("address"));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="relative border-b border-border/30 bg-paper/60 backdrop-blur-sm px-6 py-4 no-print">
        {/* Status accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${sc.color}, transparent)` }} />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1.5">
              <a href="/" className="hover:text-text transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Queue
              </a>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-text-secondary">{caseData.businessName}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-xl text-text tracking-tight">{caseData.businessName}</h1>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ color: sc.color, background: sc.color + "15", border: `1px solid ${sc.color}25` }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                {sc.label}
              </div>
            </div>
            <p className="text-text-muted text-xs mt-1">
              <span className="font-mono">{caseData.id}</span> · Submitted {formatDate(caseData.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/cases/${caseData.id}/print`}
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-display font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </a>
          </div>
        </div>
      </div>

      {/* Contradictions strip */}
      {contradictions.length > 0 && !isInvestigating && (
        <ContradictionsStrip contradictions={contradictions} />
      )}

      {/* Main 3-zone layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT RAIL */}
        <div className="w-64 shrink-0 border-r border-border/30 overflow-y-auto bg-paper/40 backdrop-blur-sm">
          <ClaimsRail caseData={caseData} />
        </div>

        {/* CENTER — Evidence Board & MCP Console */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex items-center gap-1 p-2 bg-ink/50 backdrop-blur-md border-b border-border/30 z-10 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab("board")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "board" ? "bg-accent/20 text-accent" : "text-text-muted hover:text-text"
              )}
            >
              <GitGraph className="w-3.5 h-3.5" />
              Evidence Graph
            </button>
            <button
              onClick={() => setActiveTab("network")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "network" ? "bg-indigo-500/20 text-indigo-400" : "text-text-muted hover:text-text"
              )}
            >
              <Network className="w-3.5 h-3.5" />
              Network Analysis
            </button>
            <button
              onClick={() => setActiveTab("ocr")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "ocr" ? "bg-yellow-500/20 text-yellow-400" : "text-text-muted hover:text-text"
              )}
            >
              <ScanLine className="w-3.5 h-3.5" />
              Extracted Documents
            </button>
            <button
              onClick={() => setActiveTab("mcp")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === "mcp" ? "bg-emerald-500/20 text-emerald-400" : "text-text-muted hover:text-text"
              )}
            >
              <TerminalSquare className="w-3.5 h-3.5" />
              MCP Server Trace
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {activeTab === "board" && <EvidenceBoard caseData={caseData} />}
            {activeTab === "network" && <NetworkAnalysis caseData={caseData} />}
            {activeTab === "ocr" && <OcrViewer caseData={caseData} />}
            {activeTab === "mcp" && <McpConsole caseData={caseData} />}
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="w-80 shrink-0 border-l border-border/30 overflow-y-auto bg-paper/40 backdrop-blur-sm">
          <div className="p-4 space-y-5">
            {/* GIS Map */}
            {addressClaim && (
              <div>
                <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Geospatial Verification</span>
                  {isInvestigating && <span className="text-accent text-[9px] animate-pulse">Running...</span>}
                </h3>
                {isInvestigating ? (
                  <div className="w-full h-48 rounded-xl bg-paper border border-border/30 flex items-center justify-center animate-pulse">
                    <span className="text-text-muted text-xs font-mono tracking-widest">LOADING...</span>
                  </div>
                ) : (
                  <MapContainer 
                    address={addressClaim.value} 
                    isContradicted={addressClaim.status === "contradicted"} 
                  />
                )}
              </div>
            )}

            {/* Dimension Scores */}
            <div className="border-t border-border/30 pt-5">
              <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3">
                Dimension Scores
              </h3>
              <div className="space-y-2">
                {caseData.dimensionScores.map((ds) => (
                  <DimensionScoreCard
                    key={ds.dimension}
                    score={ds}
                    isLoading={isInvestigating}
                    claims={caseData.claims.filter(c => c.dimension === ds.dimension)}
                  />
                ))}
              </div>
            </div>

            {/* Overall Score */}
            <div className="border-t border-border/30 pt-5">
              <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3">
                Authenticity Score
              </h3>
              <RadialGauge score={caseData.overallScore} isLoading={isInvestigating} />
            </div>

            {/* Recommendation */}
            <div className="border-t border-border/30 pt-5">
              <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3">
                Recommended Action
              </h3>
              <RecommendationBadge
                recommendation={caseData.recommendation ?? "request_evidence"}
                reason={caseData.recommendationReason ?? "Investigation in progress..."}
                isLoading={isInvestigating}
              />
            </div>

            {/* Missing Evidence */}
            {caseData.missingEvidence.length > 0 && (
              <div className="border-t border-border/30 pt-5">
                <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3">
                  Evidence Needed
                </h3>
                <MissingEvidenceChecklist items={caseData.missingEvidence.map((e) => e.message)} />
              </div>
            )}

            {/* Investigation Trace */}
            <div className="border-t border-border/30 pt-5">
              <h3 className="font-display font-semibold text-[11px] text-text-muted uppercase tracking-wider mb-3">
                Investigation Trace
              </h3>
              <InvestigationTrace events={caseData.trace} isLive={isInvestigating} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
