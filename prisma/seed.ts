import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { seedDatabase } from "../src/server/data/seed-data";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL chưa được cấu hình.");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
