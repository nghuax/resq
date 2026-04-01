import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import {
  listAdminRequests,
  listFixerCandidates,
} from "@/server/services/admin-service";
import {
  listPricingRulesWithServices,
  listServiceAreaRules,
} from "@/server/services/service-type-service";

export async function GET(request: Request) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;

    const [requests, fixers, pricingRules, serviceAreaRules] = await Promise.all([
      listAdminRequests(status),
      listFixerCandidates(),
      listPricingRulesWithServices(),
      listServiceAreaRules(),
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
