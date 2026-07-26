import { prisma } from "../lib/prisma";
import { runInvestigationForCase } from "../lib/investigation-engine";

async function main() {
  const pendingCases = await prisma.case.findMany({
    where: {
      OR: [
        { status: "investigating" },
        { overallScore: null }
      ]
    }
  });

  console.log(`Found ${pendingCases.length} pending case(s) needing investigation.`);

  for (const c of pendingCases) {
    console.log(`Executing multi-agent investigation for ${c.id}: ${c.businessName}...`);
    const updated = await runInvestigationForCase(c.id);
    console.log(`  -> Score: ${updated?.overallScore}/100 | Recommendation: ${updated?.recommendation} | Status: ${updated?.status}`);
  }

  console.log("Done resolving pending cases.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
