import { ApiError } from "@/lib/api-response";
import { updateFixerJobStatusSchema } from "@/schemas/fixer";
import { api, asConvexId, convexMutation, convexQuery } from "@/server/db/convex";
import type { FixerProfileView, RequestView } from "@/server/services/view-models";

export async function listFixerJobs(userId: string): Promise<RequestView[]> {
  return convexQuery<RequestView[]>(api.fixer.listFixerJobs, {
    userId: asConvexId<"users">(userId),
  });
}

export async function getFixerJobDetail(
  userId: string,
  requestId: string,
): Promise<RequestView> {
  return convexQuery<RequestView>(api.fixer.getFixerJobDetail, {
    userId: asConvexId<"users">(userId),
    requestId: asConvexId<"requests">(requestId),
  });
}

export async function updateFixerJobStatus(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = updateFixerJobStatusSchema.parse(rawInput);

  try {
    return await convexMutation(api.fixer.updateFixerJobStatus, {
      userId: asConvexId<"users">(userId),
      requestId: asConvexId<"requests">(requestId),
      status: input.status,
      note: input.note || undefined,
      etaMinutes: input.etaMinutes ?? undefined,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể cập nhật công việc.",
          400,
        );
  }
}

export async function getFixerProfileForUser(
  userId: string,
): Promise<FixerProfileView | null> {
  return convexQuery<FixerProfileView | null>(api.fixer.getFixerProfileForUser, {
    userId: asConvexId<"users">(userId),
  });
}
