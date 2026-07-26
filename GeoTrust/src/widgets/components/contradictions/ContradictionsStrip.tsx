"use client";

import type { Claim } from "@/shared-types";
import { AlertTriangle } from "lucide-react";

interface Props { contradictions: Claim[]; }

export function ContradictionsStrip({ contradictions }: Props) {
  return (
    <div className="border-b border-contradiction/30 bg-contradiction/8 px-6 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-contradiction mt-0.5 shrink-0" />
        <div>
          <span className="text-xs font-mono font-semibold text-contradiction uppercase tracking-wide mr-2">
            {contradictions.length} Contradiction{contradictions.length > 1 ? "s" : ""} detected
          </span>
          <div className="mt-1.5 space-y-1">
            {contradictions.map((c) => {
              const conflictingEvidence = c.evidence.filter(e => e.relation === "contradicts");
              const supportingEvidence = c.evidence.filter(e => e.relation === "supports");
              return (
                <div key={c.id} className="text-xs font-body text-text-muted">
                  <span className="text-text">{c.label}:</span>{" "}
                  {supportingEvidence[0]?.source && (
                    <span className="font-mono text-verified">{supportingEvidence[0].source}</span>
                  )}
                  {conflictingEvidence[0] && (
                    <>
                      {" "}conflicts with{" "}
                      <span className="font-mono text-contradiction">{conflictingEvidence[0].source}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
