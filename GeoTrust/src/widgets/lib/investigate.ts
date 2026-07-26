import { Case } from "@/shared-types";
import { getCaseById } from "@/lib/mock-data";

/**
 * THE SEAM — the only call site standing in for the backend.
 *
 * Currently returns mock data. To wire up the real MCP server:
 * - Replace the body of this function with a fetch() call to your
 *   deployed GeoTrust Chef endpoint.
 * - The return type (Case) is identical on both sides.
 *
 * Example swap (one-line change):
 *   return fetch(`/api/investigate/${caseId}`).then(r => r.json());
 */
export async function investigateCase(caseId: string): Promise<Case> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400));

  const mockCase = getCaseById(caseId);
  if (!mockCase) {
    throw new Error(`Case ${caseId} not found`);
  }

  return mockCase;
}
