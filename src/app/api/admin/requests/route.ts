import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import {
  listAdminRequests,
  listFixerCandidates,
} from "@/server/services/admin-service";
import { getDb } from "@/server/db/prisma";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const db = await getDb();

    const [requests, fixers, pricingRules, serviceAreaRules] = await Promise.all([
      listAdminRequests(status),
      listFixerCandidates(),
      db.pricingRule.findMany({
        include: { serviceType: true },
        orderBy: { createdAt: "desc" },
      }),
      db.serviceAreaRule.findMany({
        orderBy: { cityProvince: "asc" },
      }),
    ]);

    return ok({
      requests,
      fixers,
      pricingRules,
      serviceAreaRules,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
