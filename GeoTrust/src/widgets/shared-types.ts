// shared-types.ts — identical on the dashboard and the MCP server.
// This is the seam. Do not rename fields or change casing.

export type Dimension = "identity" | "location" | "digital_presence" | "document_integrity";

export interface Evidence {
  id: string;
  source: string;
  snippet: string;
  retrievedAt: string;
  reliability: number;     // 0-1
  relation: "supports" | "contradicts" | "missing";
}

export interface Claim {
  id: string;
  dimension: Dimension;
  label: string;
  value: string;
  status: "verified" | "contradicted" | "pending";
  evidence: Evidence[];
}

export interface DimensionScore {
  dimension: Dimension;
  score: number;           // 0-100
  driver: string;
}

export type Recommendation = "proceed" | "request_evidence" | "escalate" | "flag_insufficient";

export interface TraceEvent {
  timestamp: string;
  agent: "orchestrator" | "document_reader" | "registry_checker" | "address_checker" | "web_presence_checker" | "evidence_challenger" | "risk_arbiter";
  message: string;
}

export interface MissingEvidenceItem {
  id: string;
  message: string;
}

export interface Case {
  id: string;
  businessName: string;
  submittedAt: string;
  status: "new" | "investigating" | "needs_review" | "escalated" | "cleared";
  overallScore: number | null;
  dimensionScores: DimensionScore[];
  claims: Claim[];
  recommendation: Recommendation | null;
  recommendationReason: string | null;
  missingEvidence: MissingEvidenceItem[];
  trace: TraceEvent[];
}
