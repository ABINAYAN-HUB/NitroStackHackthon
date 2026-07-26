"use client";

import type { Case, Claim } from "@/shared-types";
import { statusConfig, dimensionLabel, cn } from "@/lib/utils";
import { User, MapPin, Globe, FileCheck } from "lucide-react";

const dimIcons = {
  identity: User,
  location: MapPin,
  digital_presence: Globe,
  document_integrity: FileCheck,
};

interface Props { caseData: Case; }

export function ClaimsRail({ caseData }: Props) {
  const dimensions = ["identity", "location", "digital_presence", "document_integrity"] as const;

  return (
    <div className="p-4">
      <h2 className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider mb-4">
        Claims Summary
      </h2>

      {caseData.claims.length === 0 ? (
        <div className="space-y-3">
          {dimensions.map(dim => (
            <div key={dim} className="animate-pulse">
              <div className="skeleton h-3 w-20 mb-2 rounded" />
              <div className="skeleton h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {dimensions.map(dim => {
            const Icon = dimIcons[dim];
            const claims = caseData.claims.filter(c => c.dimension === dim);
            if (claims.length === 0) return null;
            return (
              <div key={dim}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3 h-3 text-text-muted" />
                  <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
                    {dimensionLabel(dim)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {claims.map(claim => (
                    <ClaimRow key={claim.id} claim={claim} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClaimRow({ claim }: { claim: Claim }) {
  const colors = {
    verified: { dot: "bg-verified", text: "text-verified" },
    contradicted: { dot: "bg-contradiction", text: "text-contradiction" },
    pending: { dot: "bg-caution animate-pulse", text: "text-caution" },
  };
  const c = colors[claim.status];

  return (
    <div className="px-3 py-2 rounded-lg bg-ink border border-line group hover:border-border-light transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", c.dot)} />
          <div className="min-w-0">
            <div className="text-xs font-mono text-text-muted">{claim.label}</div>
            <div className="text-xs font-body text-text truncate mt-0.5" title={claim.value}>
              {claim.value}
            </div>
          </div>
        </div>
        <span className={cn("text-xs font-mono shrink-0", c.text)}>
          {claim.status}
        </span>
      </div>
    </div>
  );
}
