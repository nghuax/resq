import { savedAddressSchema } from "@/schemas/address";
import { api, asConvexId, convexMutation, convexQuery } from "@/server/db/convex";
import type { AddressView } from "@/server/services/view-models";

export async function listAddressesForUser(userId: string): Promise<AddressView[]> {
  return convexQuery<AddressView[]>(api.customer.listAddressesForUser, {
    userId: asConvexId<"users">(userId),
  });
}

export async function createAddressForUser(userId: string, rawInput: unknown) {
  const input = savedAddressSchema.parse(rawInput);
  return convexMutation(api.customer.createAddressForUser, {
    userId: asConvexId<"users">(userId),
    input,
  });
}
