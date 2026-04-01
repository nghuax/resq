import { ApiError } from "@/lib/api-response";
import { assignFixerSchema, updateAdminRequestStatusSchema } from "@/schemas/admin";
import { api, asConvexId, convexMutation, convexQuery } from "@/server/db/convex";

export async function listAdminRequests(status?: string) {
  return convexQuery(api.admin.listAdminRequests, {
    status,
  });
}

export async function listFixerCandidates() {
  return convexQuery(api.admin.listFixerCandidates, {});
}

export async function assignFixerToRequest(
  requestId: string,
  rawInput: unknown,
  actorUserId: string,
) {
  const input = assignFixerSchema.parse(rawInput);

  try {
    return await convexMutation(api.admin.assignFixerToRequest, {
      requestId: asConvexId<"requests">(requestId),
      fixerUserId: asConvexId<"users">(input.fixerUserId),
      actorUserId: asConvexId<"users">(actorUserId),
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể gán fixer.",
          400,
        );
  }
}

export async function updateRequestStatusByAdmin(
  requestId: string,
  rawInput: unknown,
  actorUserId: string,
) {
  const input = updateAdminRequestStatusSchema.parse(rawInput);

  try {
    return await convexMutation(api.admin.updateRequestStatusByAdmin, {
      requestId: asConvexId<"requests">(requestId),
      actorUserId: asConvexId<"users">(actorUserId),
      status: input.status,
      note: input.note || undefined,
      etaMinutes: input.etaMinutes ?? undefined,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể cập nhật trạng thái.",
          400,
        );
  }
}
