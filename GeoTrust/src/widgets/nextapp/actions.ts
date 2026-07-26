"use server";

import { prisma } from "@/lib/prisma";
import { runInvestigationForCase } from "@/lib/investigation-engine";

export async function createInvestigation(formData: FormData) {
  const businessName = formData.get("businessName") as string;
  const registrationNumber = formData.get("registrationNumber") as string;
  const address = formData.get("address") as string;

  const newCaseId = `case-${Date.now().toString().slice(-6)}`;
  
  // Create a pending/investigating case with initial claims
  await prisma.case.create({
    data: {
      id: newCaseId,
      businessName,
      status: "investigating",
      claims: {
        create: [
          {
            dimension: "identity",
            label: "Business Name",
            value: businessName,
            status: "pending"
          },
          {
            dimension: "identity",
            label: "Registration Number",
            value: registrationNumber,
            status: "pending"
          },
          {
            dimension: "location",
            label: "Registered Address",
            value: address,
            status: "pending"
          }
        ]
      }
    }
  });

  // Run multi-agent investigation dynamically
  await runInvestigationForCase(newCaseId, { businessName, registrationNumber, address });

  return newCaseId;
}

export async function deleteInvestigation(caseId: string) {
  // Delete related data first
  await prisma.evidence.deleteMany({ where: { claim: { caseId } } });
  await prisma.claim.deleteMany({ where: { caseId } });
  await prisma.dimensionScore.deleteMany({ where: { caseId } });
  await prisma.traceEvent.deleteMany({ where: { caseId } });
  await prisma.missingEvidence.deleteMany({ where: { caseId } });

  // Delete case
  await prisma.case.delete({
    where: { id: caseId }
  });
}
