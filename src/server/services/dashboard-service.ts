import { api, asConvexId, convexQuery } from "@/server/db/convex";
import type { CustomerDashboardView } from "@/server/services/view-models";

export async function getCustomerDashboardData(
  userId: string,
): Promise<CustomerDashboardView> {
  return convexQuery<CustomerDashboardView>(api.customer.getCustomerDashboardData, {
    userId: asConvexId<"users">(userId),
  });
}
