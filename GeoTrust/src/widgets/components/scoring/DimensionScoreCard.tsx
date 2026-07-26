"use client";

import { useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import type { DimensionScore, Claim } from "@/shared-types";
import { dimensionLabel, scoreColor, cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  score: DimensionScore;
  isLoading: boolean;
  claims: Claim[];
}

export function DimensionScoreCard({ score, isLoading, claims }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = scoreColor(score.score);

  if (isLoading) {
    return (
      <div className="bg-ink border border-line rounded-lg p-3 score-card">
        <div className="skeleton h-3 w-24 mb-2 rounded" />
        <div className="skeleton h-5 w-10 mb-1 rounded" />
        <div className="skeleton h-2 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-ink border border-line rounded-lg p-3 score-card transition-all cursor-pointer"
      onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-text-muted mb-1">
            {dimensionLabel(score.dimension)}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg" style={{ color }}>
              {score.score}
            </span>
            <span className="text-text-muted text-xs font-mono">/100</span>
          </div>
          {/* Score bar */}
          <div className="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score.score}%`, background: color }}
            />
          </div>
        </div>
        <div className="ml-3 shrink-0 text-text-muted">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Driver */}
      <p className="text-xs font-body text-text-muted mt-2 leading-relaxed">{score.driver}</p>

      {/* Expanded evidence breakdown */}
      {expanded && claims.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line space-y-2">
          <div className="text-xs font-mono text-text-muted uppercase tracking-wide">Evidence breakdown</div>
          {claims.flatMap(c => c.evidence).map((ev, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-1 shrink-0",
                ev.relation === "supports" ? "bg-verified" : ev.relation === "contradicts" ? "bg-contradiction" : "bg-line"
              )} />
              <div className="min-w-0">
                <div className="text-xs font-mono text-text-muted truncate">{ev.source}</div>
                <div className="text-xs font-body text-text-muted line-clamp-2">{ev.snippet}</div>
                <div className="text-xs font-mono text-text-muted mt-0.5">
                  Weight: {Math.round(ev.reliability * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
