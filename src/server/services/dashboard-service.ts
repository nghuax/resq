import { getDb } from "@/server/db/prisma";
import { requestDetailsInclude } from "@/server/services/request-shared";

export async function getCustomerDashboardData(userId: string) {
  const db = await getDb();

  const [vehicles, addresses, requests, activeRequest] = await Promise.all([
    db.vehicle.count({
      where: {
        userId,
      },
    }),
    db.savedAddress.count({
      where: {
        userId,
      },
    }),
    db.request.findMany({
      where: {
        userId,
      },
      include: requestDetailsInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    db.request.findFirst({
      where: {
        userId,
        status: {
          notIn: ["completed", "cancelled"],
        },
      },
      include: requestDetailsInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    vehicleCount: vehicles,
    addressCount: addresses,
    requests,
    activeRequest,
  };
}
