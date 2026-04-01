import { api, asConvexId, convexQuery } from "@/server/db/convex";
import type { FixerProfileView, ServiceTypeView } from "@/server/services/view-models";

export async function listServiceTypes(): Promise<ServiceTypeView[]> {
  return convexQuery<ServiceTypeView[]>(api.catalog.listServiceTypes, {});
}

export async function listPricingRulesWithServices() {
  return convexQuery(api.catalog.listPricingRulesWithServices, {});
}

export async function listServiceAreaRules() {
  return convexQuery(api.catalog.listServiceAreaRules, {});
}

export async function getFixerProfileByUserId(
  userId: string,
): Promise<FixerProfileView | null> {
  return convexQuery<FixerProfileView | null>(api.catalog.getFixerProfileByUserIdQuery, {
    userId: asConvexId<"users">(userId),
  });
}
