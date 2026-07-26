"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Claim, Evidence } from "@/shared-types";
import { X, ExternalLink, Calendar, Shield, AlertTriangle, Minus } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface Props {
  selected: { type: "claim" | "evidence"; data: Claim | Evidence };
  onClose: () => void;
}

export function NodeDetailPanel({ selected, onClose }: Props) {
  const isClaim = selected.type === "claim";
  const claim = isClaim ? (selected.data as Claim) : null;
  const evidence = !isClaim ? (selected.data as Evidence) : null;

  const relIcon = evidence?.relation === "supports"
    ? <Shield className="w-3.5 h-3.5 text-verified" />
    : evidence?.relation === "contradicts"
      ? <AlertTriangle className="w-3.5 h-3.5 text-contradiction" />
      : <Minus className="w-3.5 h-3.5 text-text-muted" />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute right-0 top-0 h-full w-80 bg-paper border-l border-line z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-paper border-b border-line px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
            {isClaim ? "Claim Detail" : "Evidence Detail"}
          </span>
          <button onClick={onClose} className="p-1 hover:text-text text-text-muted rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {claim && (
            <>
              <div>
                <div className="text-xs font-mono text-text-muted mb-1">{claim.dimension.replace("_", " ")}</div>
                <div className="font-display font-semibold text-text text-base">{claim.label}</div>
                <div className="font-mono text-sm text-text-muted mt-1">{claim.value}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  claim.status === "verified" ? "bg-verified" : claim.status === "contradicted" ? "bg-contradiction" : "bg-caution"
                )} />
                <span className={cn(
                  "text-xs font-mono",
                  claim.status === "verified" ? "text-verified" : claim.status === "contradicted" ? "text-contradiction" : "text-caution"
                )}>{claim.status}</span>
              </div>

              <div>
                <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
                  Evidence ({claim.evidence.length})
                </div>
                <div className="space-y-2">
                  {claim.evidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-ink rounded-lg border border-line">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {ev.relation === "supports" ? <Shield className="w-3 h-3 text-verified" /> :
                          ev.relation === "contradicts" ? <AlertTriangle className="w-3 h-3 text-contradiction" /> :
                            <Minus className="w-3 h-3 text-text-muted" />}
                        <span className="text-xs font-mono text-text-muted">{ev.source}</span>
                      </div>
                      <p className="text-xs font-body text-text">{ev.snippet}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-mono text-text-muted">{Math.round(ev.reliability * 100)}% reliable</span>
                        <span className="text-xs font-mono text-text-muted">{formatDate(ev.retrievedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {evidence && (
            <>
              <div className="flex items-center gap-1.5">
                {relIcon}
                <span className={cn(
                  "text-xs font-mono",
                  evidence.relation === "supports" ? "text-verified" : evidence.relation === "contradicts" ? "text-contradiction" : "text-text-muted"
                )}>{evidence.relation}</span>
              </div>

              <div>
                <div className="text-xs font-mono text-text-muted mb-1">Source</div>
                <div className="font-mono text-sm text-text">{evidence.source}</div>
              </div>

              <div>
                <div className="text-xs font-mono text-text-muted mb-1">Snippet</div>
                <p className="text-sm font-body text-text leading-relaxed">{evidence.snippet}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ink rounded-lg p-3 border border-line">
                  <div className="text-xs font-mono text-text-muted mb-0.5">Reliability</div>
                  <div className="font-mono text-base font-semibold text-text">
                    {Math.round(evidence.reliability * 100)}%
                  </div>
                </div>
                <div className="bg-ink rounded-lg p-3 border border-line">
                  <div className="text-xs font-mono text-text-muted mb-0.5">Retrieved</div>
                  <div className="font-mono text-xs text-text">{formatDate(evidence.retrievedAt)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
