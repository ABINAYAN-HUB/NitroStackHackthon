"use client";

import { CheckSquare } from "lucide-react";

interface Props { items: string[]; }

export function MissingEvidenceChecklist({ items }: Props) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-ink border border-line">
          <CheckSquare className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
          <span className="text-xs font-body text-text-muted leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  );
}
