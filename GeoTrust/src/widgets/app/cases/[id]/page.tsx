import { getCaseById, MOCK_CASES } from "@/lib/mock-data";
import { CaseInvestigationView } from "./CaseInvestigationView";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return MOCK_CASES.map((c) => ({ id: c.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: Props) {
  const { id } = await params;
  const caseData = getCaseById(id);
  
  if (!caseData) notFound();

  return <CaseInvestigationView caseData={caseData as any} />;
}
