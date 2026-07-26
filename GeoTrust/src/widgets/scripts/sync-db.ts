import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import fs from "fs";
import path from "path";

const libsql = createClient({ url: "file:./dev.db" });
const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function sync() {
  const dataPath = path.join(process.cwd(), "lib", "live-cases.json");
  if (!fs.existsSync(dataPath)) {
    console.error("No live-cases.json found");
    return;
  }
  
  const cases = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  for (const c of cases) {
    // Delete if exists
    const existing = await prisma.case.findUnique({ where: { id: c.id } });
    if (existing) {
      await prisma.case.delete({ where: { id: c.id } });
    }
    
    // Insert new
    await prisma.case.create({
      data: {
        id: c.id,
        businessName: c.businessName,
        submittedAt: new Date(c.submittedAt),
        status: c.status,
        overallScore: c.overallScore,
        recommendation: c.recommendation,
        recommendationReason: c.recommendationReason,
        
        dimensionScores: {
          create: c.dimensionScores.map((d: any) => ({
            dimension: d.dimension,
            score: d.score,
            driver: d.driver,
          }))
        },
        
        claims: {
          create: c.claims.map((claim: any) => ({
            dimension: claim.dimension,
            label: claim.label,
            value: claim.value,
            status: claim.status,
            evidence: {
              create: claim.evidence.map((e: any) => ({
                source: e.source,
                snippet: e.snippet,
                retrievedAt: new Date(e.retrievedAt),
                reliability: e.reliability,
                relation: e.relation
              }))
            }
          }))
        },
        
        trace: {
          create: c.trace.map((t: any) => ({
            timestamp: new Date(t.timestamp),
            agent: t.agent,
            message: t.message
          }))
        },
        
        missingEvidence: {
          create: c.missingEvidence.map((m: any) => ({
            message: typeof m === 'string' ? m : m.message
          }))
        }
      }
    });
    console.log(`Synced case ${c.id}`);
  }
  
  console.log("Database sync complete.");
}

sync().catch(console.error).finally(() => prisma.$disconnect());
