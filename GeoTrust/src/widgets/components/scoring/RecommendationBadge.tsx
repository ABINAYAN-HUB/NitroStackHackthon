"use client";

import { useEffect, useState } from "react";
import type { Recommendation } from "@/shared-types";
import { recommendationConfig } from "@/lib/utils";

interface Props {
  recommendation: Recommendation | null;
  reason: string | null;
  isLoading: boolean;
}

export function RecommendationBadge({ recommendation, reason, isLoading }: Props) {
  const [stamped, setStamped] = useState(false);
  const cfg = recommendationConfig(recommendation);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setStamped(true), 200);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div>
        <div className="skeleton h-12 w-full rounded-lg mb-2" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    );
  }

  return (
    <div>
      {/* Stamp */}
      <div
        className={`${stamped ? "stamp-animate" : "opacity-0"} inline-block w-full`}
      >
        <div
          className="px-4 py-3 rounded-lg border-2 text-center"
          style={{
            borderColor: cfg.border,
            background: cfg.bg,
            color: cfg.color,
            transform: "rotate(-1.5deg)",
            position: "relative",
          }}
        >
          {/* Stamp border effect */}
          <div
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{
              border: `3px solid ${cfg.color}`,
              opacity: 0.3,
              margin: "3px",
            }}
          />
          <span className="font-display font-black text-sm tracking-widest uppercase">
            {cfg.label}
          </span>
        </div>
      </div>
      {/* Reason */}
      <p className="text-xs font-body text-text-muted mt-3 leading-relaxed">{reason ?? "Investigation complete."}</p>
    </div>
  );
}
