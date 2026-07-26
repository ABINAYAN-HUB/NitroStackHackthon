"use client";

import { useEffect, useState } from "react";

// ── Types (inline — no @/ aliases, esbuild doesn't resolve them) ─────────────
type Dimension = "identity" | "location" | "digital_presence" | "document_integrity";
type Recommendation = "proceed" | "request_evidence" | "escalate" | "flag_insufficient";
interface MissingEvidenceItem { id: string; message: string; }
interface DimensionScore { dimension: Dimension; score: number; driver: string; }
interface Claim { id: string; dimension: Dimension; label: string; value: string; status: "verified" | "contradicted" | "pending"; evidence: any[]; }
interface TraceEvent { timestamp: string; agent: string; message: string; }
interface Case {
  id: string; businessName: string; submittedAt: string;
  status: "new" | "investigating" | "needs_review" | "escalated" | "cleared";
  overallScore: number | null;
  dimensionScores: DimensionScore[];
  claims: Claim[];
  recommendation: Recommendation | null;
  recommendationReason: string | null;
  missingEvidence: (MissingEvidenceItem | string)[];
  trace: TraceEvent[];
}

// ── Utils (inline — no imports) ───────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 70) return "#34D399";
  if (s >= 45) return "#FBBF24";
  return "#F87171";
}
function scoreLabel(s: number) {
  if (s >= 70) return "High";
  if (s >= 45) return "Medium";
  return "Low";
}
function dimLabel(d: Dimension) {
  return { identity: "Identity", location: "Location", digital_presence: "Digital Presence", document_integrity: "Doc Integrity" }[d] ?? d;
}
function recConfig(r: Recommendation | null) {
  const m: Record<string, { label: string; bg: string; color: string; border: string }> = {
    proceed:            { label: "PROCEED",           bg: "rgba(52,211,153,0.08)",  color: "#34D399", border: "#34D399" },
    request_evidence:   { label: "REQUEST EVIDENCE",  bg: "rgba(251,191,36,0.08)",  color: "#FBBF24", border: "#FBBF24" },
    escalate:           { label: "ESCALATE",          bg: "rgba(248,113,113,0.08)", color: "#F87171", border: "#F87171" },
    flag_insufficient:  { label: "INSUFFICIENT",      bg: "rgba(248,113,113,0.08)", color: "#F87171", border: "#F87171" },
  };
  return m[r ?? "request_evidence"] ?? m["request_evidence"];
}
function statusCfg(s: string) {
  const m: Record<string, { bg: string; color: string; label: string }> = {
    cleared:       { bg: "rgba(52,211,153,0.12)",  color: "#34D399", label: "Cleared" },
    needs_review:  { bg: "rgba(251,191,36,0.12)",  color: "#FBBF24", label: "Needs Review" },
    escalated:     { bg: "rgba(248,113,113,0.12)", color: "#F87171", label: "Escalated" },
    investigating: { bg: "rgba(129,140,248,0.12)", color: "#818CF8", label: "Investigating" },
    new:           { bg: "rgba(100,116,139,0.12)", color: "#64748B", label: "New" },
  };
  return m[s] ?? m["new"];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GeoTrustWidget() {
  const [data, setData] = useState<Case | null>(null);

  useEffect(() => {
    // NitroStack MCP host injects tool output here
    const toolOutput = (window as any).openai?.toolOutput as Case | undefined;
    if (toolOutput) setData(toolOutput);
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#080B11", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #1E2A3A", borderTopColor: "#34D399", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B", fontSize: 13, fontFamily: "monospace" }}>Awaiting investigation data...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const score = data.overallScore ?? 0;
  const color = scoreColor(score);
  const rec = recConfig(data.recommendation);
  const st = statusCfg(data.status);
  const contradictions = data.claims.filter(c => c.status === "contradicted");

  const S: Record<string, React.CSSProperties> = {
    root:   { minHeight: "100vh", background: "#080B11", color: "#F1F5F9", fontFamily: "Inter,system-ui,sans-serif", padding: 24, fontSize: 14 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #1E2A3A" },
    tag:    { fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1, padding: "2px 10px", borderRadius: 6, display: "inline-block" },
    card:   { background: "#111820", border: "1px solid #1E2A3A", borderRadius: 12, padding: 12, marginBottom: 8 },
    muted:  { color: "#64748B", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: 1 },
    secHdr: { color: "#64748B", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 10 },
    grid2:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={{ ...S.muted, marginBottom: 4 }}>🛡 GeoTrust AI · Investigation Report</div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#FFF", lineHeight: 1.2 }}>{data.businessName}</h1>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...S.tag, background: st.bg, color: st.color }}>{st.label}</span>
            <span style={{ ...S.muted, textTransform: "none" }}>#{data.id.slice(0, 8)}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color }}>{score}</div>
          <div style={{ color: "#64748B", fontSize: 11, fontFamily: "monospace" }}>/100</div>
          <div style={{ color, fontSize: 12, fontFamily: "monospace", marginTop: 4 }}>{scoreLabel(score)} Confidence</div>
        </div>
      </div>

      {/* Recommendation */}
      <div style={{ background: rec.bg, border: `1px solid ${rec.border}50`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <div style={{ color: rec.color, fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{rec.label}</div>
        <div style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6 }}>{data.recommendationReason ?? "Investigation complete."}</div>
      </div>

      {/* Contradictions */}
      {contradictions.length > 0 && (
        <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ color: "#F87171", fontWeight: 700, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            ⚠ {contradictions.length} Contradiction{contradictions.length > 1 ? "s" : ""} Detected
          </div>
          {contradictions.map(c => (
            <div key={c.id} style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
              <span style={{ color: "#F1F5F9" }}>{c.label}:</span> {c.value}
            </div>
          ))}
        </div>
      )}

      {/* Dimension Scores */}
      <div style={S.secHdr}>Dimension Scores</div>
      <div style={S.grid2}>
        {data.dimensionScores.map(ds => {
          const c = scoreColor(ds.score);
          return (
            <div key={ds.dimension} style={S.card}>
              <div style={S.muted}>{dimLabel(ds.dimension)}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c, lineHeight: 1.2, marginTop: 4 }}>{ds.score}<span style={{ fontSize: 12, color: "#64748B", fontWeight: 400 }}>/100</span></div>
              <div style={{ height: 4, background: "#1E2A3A", borderRadius: 2, margin: "8px 0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${ds.score}%`, background: c, borderRadius: 2 }} />
              </div>
              <div style={{ color: "#64748B", fontSize: 11, lineHeight: 1.5 }}>{ds.driver}</div>
            </div>
          );
        })}
      </div>

      {/* Claims */}
      {data.claims.length > 0 && (
        <>
          <div style={S.secHdr}>Claims ({data.claims.length})</div>
          {data.claims.map(claim => {
            const sc = claim.status === "verified" ? "#34D399" : claim.status === "contradicted" ? "#F87171" : "#FBBF24";
            return (
              <div key={claim.id} style={{ ...S.card, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.muted}>{claim.label}</div>
                  <div style={{ fontSize: 12, color: "#F1F5F9", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{claim.value}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc }} />
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: sc, textTransform: "uppercase" }}>{claim.status}</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginBottom: 14 }} />
        </>
      )}

      {/* Missing Evidence */}
      {data.missingEvidence.length > 0 && (
        <>
          <div style={S.secHdr}>Evidence Needed ({data.missingEvidence.length})</div>
          {data.missingEvidence.map((item, i) => (
            <div key={i} style={{ ...S.card, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#FBBF24", fontSize: 12, flexShrink: 0 }}>○</span>
              <span style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>
                {typeof item === "string" ? item : item.message}
              </span>
            </div>
          ))}
          <div style={{ marginBottom: 14 }} />
        </>
      )}

      {/* Trace */}
      {data.trace.length > 0 && (
        <>
          <div style={S.secHdr}>Agent Trace ({data.trace.length} steps)</div>
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {data.trace.map((ev, i) => (
              <div key={i} style={{ borderLeft: "2px solid #818CF8", paddingLeft: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#818CF8", textTransform: "uppercase", letterSpacing: 1 }}>{ev.agent}</div>
                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{ev.message}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #1E2A3A", color: "#64748B", fontSize: 10, fontFamily: "monospace" }}>
        🛡 GeoTrust AI · NitroStack MCP Platform
      </div>
    </div>
  );
}
