import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

declare global {
  var resqPrisma: PrismaClient | undefined;
  var resqPrismaPromise: Promise<PrismaClient> | undefined;
}

async function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  return prisma;
}

export async function getDb() {
  if (globalThis.resqPrisma) {
    return globalThis.resqPrisma;
  }

  if (!globalThis.resqPrismaPromise) {
    globalThis.resqPrismaPromise = createPrismaClient();
  }

  globalThis.resqPrisma = await globalThis.resqPrismaPromise;
  return globalThis.resqPrisma;
}
