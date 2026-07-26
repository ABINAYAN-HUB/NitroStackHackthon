import { prisma } from "@/lib/prisma";
import { runInvestigationForCase } from "@/lib/investigation-engine";
import { CaseQueueClient } from "./CaseQueueClient";
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default async function CaseQueuePage() {
  let cases = await prisma.case.findMany({
    orderBy: { submittedAt: 'desc' },
    include: {
      claims: {
        include: { evidence: true }
      },
      dimensionScores: true,
      missingEvidence: true,
      trace: true
    }
  });

  // Auto-investigate any case stuck in 'investigating' status or missing scores
  const pendingCases = cases.filter(c => c.status === "investigating" || c.overallScore === null);
  if (pendingCases.length > 0) {
    for (const p of pendingCases) {
      await runInvestigationForCase(p.id);
    }
    cases = await prisma.case.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        claims: {
          include: { evidence: true }
        },
        dimensionScores: true,
        missingEvidence: true,
        trace: true
      }
    });
  }

  const cleared = cases.filter(c => c.status === "cleared").length;
  const escalated = cases.filter(c => c.status === "needs_review" || c.status === "escalated").length;
  const investigating = cases.filter(c => c.status === "investigating").length;
  const scoredCases = cases.filter(c => c.overallScore && c.overallScore > 0);
  const avgScore = scoredCases.length > 0 
    ? Math.round(scoredCases.reduce((s, c) => s + (c.overallScore || 0), 0) / scoredCases.length)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative border-b border-border/30 bg-paper/60 backdrop-blur-sm px-8 py-8 overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-verified via-accent to-caution" />
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display font-bold text-2xl text-text tracking-tight">
                  Case Queue
                </h1>
                <span className="px-2.5 py-0.5 bg-verified/10 border border-verified/20 rounded-full text-verified text-xs font-medium">
                  {cases.length} active
                </span>
              </div>
              <p className="text-text-muted text-sm">
                Monitor and manage business authenticity investigations
              </p>
            </div>
            <a
              href="/cases/new"
              className="px-5 py-2.5 bg-gradient-to-r from-verified to-emerald-500 text-ink font-display font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-verified/20 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span className="text-lg leading-none">+</span>
              New Investigation
            </a>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card-sm p-4 animate-fade-in-up stagger-1">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase">Total</span>
              </div>
              <div className="text-2xl font-display font-bold text-text">{cases.length}</div>
              <p className="text-text-muted text-xs mt-0.5">Active cases</p>
            </div>

            <div className="glass-card-sm p-4 animate-fade-in-up stagger-2">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-verified/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-verified" />
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase">Cleared</span>
              </div>
              <div className="text-2xl font-display font-bold text-verified">{cleared}</div>
              <p className="text-text-muted text-xs mt-0.5">Passed verification</p>
            </div>

            <div className="glass-card-sm p-4 animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-contradiction/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-contradiction" />
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase">Escalated</span>
              </div>
              <div className="text-2xl font-display font-bold text-contradiction">{escalated}</div>
              <p className="text-text-muted text-xs mt-0.5">Needs review</p>
            </div>

            <div className="glass-card-sm p-4 animate-fade-in-up stagger-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-caution/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-caution" />
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase">Avg Score</span>
              </div>
              <div className="text-2xl font-display font-bold text-text">{avgScore}</div>
              <p className="text-text-muted text-xs mt-0.5">Authenticity score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <CaseQueueClient cases={cases as any} />
      </div>
    </div>
  );
}
