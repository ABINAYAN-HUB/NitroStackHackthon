"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, Filter, ChevronRight, AlertTriangle, CheckCircle2, Clock, FileSearch, Building2, ArrowRight, Trash2 } from "lucide-react";
import type { Case } from "@/shared-types";
import { statusConfig, scoreColor, formatDate, cn } from "@/lib/utils";
import { deleteInvestigation } from "./actions";
import { useRouter } from "next/navigation";

interface Props {
  cases: Case[];
}

export function CaseQueueClient({ cases }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<"submittedAt" | "overallScore" | "businessName">("submittedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const sorted = useMemo(() => {
    return [...cases]
      .filter((c) => filterStatus === "all" || c.status === filterStatus)
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "submittedAt") cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        else if (sortKey === "overallScore") cmp = (a.overallScore ?? 0) - (b.overallScore ?? 0);
        else cmp = a.businessName.localeCompare(b.businessName);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [cases, sortKey, sortDir, filterStatus]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const flagSummary = (c: Case): { text: string; type: "danger" | "warning" | "ok" | "loading" } => {
    const contradictions = c.claims.filter(cl => cl.status === "contradicted").length;
    if (c.status === "investigating") return { text: "Running...", type: "loading" };
    if (contradictions > 0) return { text: `${contradictions} contradiction${contradictions > 1 ? "s" : ""}`, type: "danger" };
    if (c.missingEvidence.length > 0) return { text: `${c.missingEvidence.length} missing`, type: "warning" };
    return { text: "Clear", type: "ok" };
  };

  const statusFilters = [
    { value: "all", label: "All", count: cases.length },
    { value: "investigating", label: "In Progress", count: cases.filter(c => c.status === "investigating").length },
    { value: "needs_review", label: "Needs Review", count: cases.filter(c => c.status === "needs_review").length },
    { value: "escalated", label: "Escalated", count: cases.filter(c => c.status === "escalated").length },
    { value: "cleared", label: "Cleared", count: cases.filter(c => c.status === "cleared").length },
  ];

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
          <FileSearch className="w-7 h-7 text-accent" />
        </div>
        <h2 className="font-display font-bold text-xl text-text mb-2">No cases yet</h2>
        <p className="text-text-muted text-sm max-w-sm mb-6">
          Start your first investigation to review business authenticity claims.
        </p>
        <Link href="/cases/new" className="px-5 py-2.5 bg-gradient-to-r from-verified to-emerald-500 text-ink font-display font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-verified/20 transition-all">
          Start first investigation
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-3.5 h-3.5 text-text-muted" />
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              filterStatus === s.value
                ? "bg-accent/15 text-accent border border-accent/25 shadow-sm"
                : "text-text-muted border border-border/50 hover:border-border-light hover:text-text hover:bg-paper-hover/30"
            )}
          >
            {s.label}
            {s.count > 0 && (
              <span className={cn(
                "ml-1.5 text-[10px] font-mono",
                filterStatus === s.value ? "text-accent/70" : "text-text-muted/60"
              )}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_100px_1fr_1.2fr_40px_40px] gap-4 px-6 py-3 border-b border-border/30 bg-paper-raised/30">
          <button onClick={() => toggleSort("businessName")} className="flex items-center gap-1.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider hover:text-text transition-colors">
            Business <ArrowUpDown className="w-3 h-3 opacity-50" />
          </button>
          <button onClick={() => toggleSort("submittedAt")} className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider hover:text-text transition-colors">
            Submitted <ArrowUpDown className="w-3 h-3 opacity-50" />
          </button>
          <button onClick={() => toggleSort("overallScore")} className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider hover:text-text transition-colors">
            Score <ArrowUpDown className="w-3 h-3 opacity-50" />
          </button>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Flags</span>
          <span />
          <span />
        </div>

        {sorted.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm">
            No cases match current filters
          </div>
        ) : (
          sorted.map((c, i) => {
            const sc = statusConfig(c.status);
            const flags = flagSummary(c);
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className={cn(
                  "grid grid-cols-[2fr_1fr_100px_1fr_1.2fr_40px_40px] gap-4 px-6 py-4 items-center",
                  "border-b border-border/20 hover:bg-paper-hover/40 transition-all duration-200 group cursor-pointer",
                  i === sorted.length - 1 && "border-b-0",
                  `animate-fade-in-up stagger-${Math.min(i + 1, 5)}`
                )}
              >
                {/* Business */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/8 border border-border/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-text text-sm group-hover:text-accent transition-colors">
                      {c.businessName}
                    </div>
                    <div className="text-text-muted text-[11px] font-mono mt-0.5">{c.id}</div>
                  </div>
                </div>

                {/* Submitted */}
                <div className="text-text-muted text-xs">
                  {formatDate(c.submittedAt)}
                </div>

                {/* Score */}
                <div>
                  {c.status === "investigating" ? (
                    <div className="skeleton w-12 h-7 rounded-lg" />
                  ) : (
                    <span
                      className="score-badge inline-block"
                      style={{
                        color: scoreColor(c.overallScore),
                        background: scoreColor(c.overallScore) + "18",
                        border: `1px solid ${scoreColor(c.overallScore)}30`,
                      }}
                    >
                      {c.overallScore}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className="status-dot" style={{ background: sc.dot, color: sc.dot }} />
                  <span className="text-xs font-medium" style={{ color: sc.color }}>{sc.label}</span>
                </div>

                {/* Flags */}
                <div className="flex items-center gap-2">
                  {flags.type === "loading" ? (
                    <div className="flex items-center gap-1.5 text-caution">
                      <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                      <span className="text-xs font-medium">{flags.text}</span>
                    </div>
                  ) : flags.type === "danger" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-contradiction/8 border border-contradiction/15">
                      <AlertTriangle className="w-3 h-3 text-contradiction" />
                      <span className="text-[11px] font-medium text-contradiction">{flags.text}</span>
                    </div>
                  ) : flags.type === "warning" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-caution/8 border border-caution/15">
                      <AlertTriangle className="w-3 h-3 text-caution" />
                      <span className="text-[11px] font-medium text-caution">{flags.text}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-verified/8 border border-verified/15">
                      <CheckCircle2 className="w-3 h-3 text-verified" />
                      <span className="text-[11px] font-medium text-verified">{flags.text}</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                
                {/* Delete Button */}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this case?")) {
                      await deleteInvestigation(c.id);
                      router.refresh();
                    }
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-contradiction/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete Investigation"
                >
                  <Trash2 className="w-4 h-4 text-contradiction/70 hover:text-contradiction" />
                </button>
              </Link>
            );
          })
        )}
      </div>

      <p className="text-text-muted text-[11px] mt-4">
        Showing {sorted.length} of {cases.length} cases · Sorted by {sortKey === "submittedAt" ? "date" : sortKey === "overallScore" ? "score" : "name"}
      </p>
    </div>
  );
}
