import { prisma } from "@/lib/prisma";
import { runInvestigationForCase } from "@/lib/investigation-engine";
import { notFound } from "next/navigation";
import { CaseInvestigationView } from "./CaseInvestigationView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: Props) {
  const { id } = await params;
  let caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      claims: {
        include: { evidence: true }
      },
      dimensionScores: true,
      missingEvidence: true,
      trace: true
    }
  });
  
  if (!caseData) notFound();

  // If case is pending/investigating, auto-execute multi-agent investigation pipeline dynamically
  if (caseData.status === "investigating" || caseData.overallScore === null) {
    caseData = (await runInvestigationForCase(id)) as any;
  }

  return <CaseInvestigationView caseData={caseData as any} />;
}
