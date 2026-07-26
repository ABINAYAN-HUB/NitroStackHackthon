import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Recommendation, Case } from "@/shared-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number | null | undefined): string {
  const s = score ?? 0;
  if (s >= 70) return "#34D399";
  if (s >= 45) return "#FBBF24";
  return "#F87171";
}

export function scoreLabel(score: number | null | undefined): string {
  const s = score ?? 0;
  if (s >= 70) return "High";
  if (s >= 45) return "Medium";
  return "Low";
}

export function recommendationConfig(rec: Recommendation | string | null | undefined) {
  const configs: Record<string, { label: string; color: string; bg: string; border: string }> = {
    proceed: {
      label: "PROCEED",
      color: "#34D399",
      bg: "rgba(52,211,153,0.1)",
      border: "rgba(52,211,153,0.25)",
    },
    request_evidence: {
      label: "REQUEST MORE EVIDENCE",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.25)",
    },
    needs_review: {
      label: "NEEDS REVIEW",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.1)",
      border: "rgba(251,191,36,0.25)",
    },
    escalate: {
      label: "ESCALATE FOR REVIEW",
      color: "#F87171",
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.25)",
    },
    flag_insufficient: {
      label: "INSUFFICIENT EVIDENCE",
      color: "#64748B",
      bg: "rgba(100,116,139,0.1)",
      border: "rgba(100,116,139,0.25)",
    },
  };
  return configs[rec ?? "needs_review"] ?? configs.needs_review;
}

export function statusConfig(status: Case["status"] | string | null | undefined) {
  const configs: Record<string, { label: string; color: string; dot: string }> = {
    new:           { label: "New",           color: "#64748B", dot: "#64748B" },
    investigating: { label: "Investigating", color: "#FBBF24", dot: "#FBBF24" },
    needs_review:  { label: "Needs Review",  color: "#FBBF24", dot: "#FBBF24" },
    escalated:     { label: "Escalated",     color: "#F87171", dot: "#F87171" },
    cleared:       { label: "Cleared",       color: "#34D399", dot: "#34D399" },
  };
  return configs[status ?? "investigating"] ?? configs.investigating;
}

export function dimensionLabel(dim: string): string {
  return {
    identity: "Identity",
    location: "Location",
    digital_presence: "Digital Presence",
    document_integrity: "Document Integrity",
  }[dim] ?? dim;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
