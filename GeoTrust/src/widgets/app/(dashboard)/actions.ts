"use client";

import { MOCK_CASES } from "@/lib/mock-data";

export async function createInvestigation(formData: FormData) {
  console.log("Mock createInvestigation called", formData);
  return { success: true, caseId: "case-001" };
}

export async function resolveCase(caseId: string, status: string) {
  console.log("Mock resolveCase called", caseId, status);
  return { success: true };
}

export async function deleteInvestigation(caseId: string) {
  console.log("Mock deleteInvestigation called", caseId);
  return { success: true };
}
