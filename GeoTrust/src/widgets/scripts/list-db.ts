import { prisma } from "../lib/prisma";

async function main() {
  const cases = await prisma.case.findMany();
  console.log("All cases in DB:", cases.map(c => ({ id: c.id, name: c.businessName, status: c.status, score: c.overallScore })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
