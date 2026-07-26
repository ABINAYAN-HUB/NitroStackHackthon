import type { Case, TraceEvent } from "@/shared-types";

// ── Live data feed ────────────────────────────────────────────────────────
import liveCasesData from "./live-cases.json";

export const MOCK_CASES: Case[] = liveCasesData as unknown as Case[];

export function getCaseById(id: string): Case | undefined {
  return MOCK_CASES.find((c) => c.id === id);
}
