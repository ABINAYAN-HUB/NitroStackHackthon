import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Safe Prisma initialization.
 *
 * During static export (`next build` with `output: 'export'`), there is no
 * database available. We guard against crashes by only creating the client
 * when a SQLite file or DATABASE_URL is accessible.
 *
 * At runtime (dev server or API routes), the client connects normally.
 */
function createPrismaClient(): PrismaClient {
  try {
    const adapter = new PrismaLibSql({
      url: process.env.DATABASE_URL || "file:./dev.db",
    });
    return new PrismaClient({ adapter });
  } catch {
    // During static export, Prisma adapter may fail — return a stub
    // that throws a clear error on any actual database call.
    console.warn(
      "[prisma] Database not available — running in static export mode."
    );
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then" || prop === "$connect" || prop === "$disconnect") {
          return undefined;
        }
        return () => {
          throw new Error(
            `Database operation "${String(prop)}" called during static export. ` +
            `This is not supported. Use mock data or API routes instead.`
          );
        };
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
