import { prisma } from "../lib/prisma";
import { runInvestigationForCase } from "../lib/investigation-engine";

async function main() {
  const cases = await prisma.case.findMany();
  for (const c of cases) {
    console.log(`Re-evaluating case ${c.id}: ${c.businessName}...`);
    const res = await runInvestigationForCase(c.id);
    console.log(`  -> ID: ${c.id} | Score: ${res?.overallScore} | Recommendation: ${res?.recommendation} | Status: ${res?.status}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
