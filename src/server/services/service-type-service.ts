import { getDb } from "@/server/db/prisma";

export async function listServiceTypes() {
  const db = await getDb();

  return db.serviceType.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        isFuelService: "asc",
      },
      {
        basePriceVnd: "asc",
      },
    ],
  });
}
