import { ApiError } from "@/lib/api-response";
import { api, asConvexId, convexQuery } from "@/server/db/convex";
import type { RequestView } from "@/server/services/view-models";

export type RequestDetails = RequestView;

export async function findRequestById(requestId: string) {
  const request = await convexQuery<RequestDetails>(api.customer.getRequestById, {
    requestId: asConvexId<"requests">(requestId),
  });

  if (!request) {
    throw new ApiError("Không tìm thấy yêu cầu.", 404);
  }

  return request;
}

export function canCustomerCancel(status: string) {
  return ["submitted", "processing", "fixer_matched"].includes(status);
}

export function getLatestEtaMinutes(request: RequestDetails) {
  const latestWithEta = [...request.statusLogs]
    .reverse()
    .find((log) => typeof log.etaMinutes === "number");

  return latestWithEta?.etaMinutes ?? null;
}

export function ensureCustomerOwnsRequest(request: RequestDetails, userId: string) {
  if (request.userId !== userId) {
    throw new ApiError("Bạn không có quyền truy cập yêu cầu này.", 403);
  }
}

export function ensureFixerOwnsRequest(request: RequestDetails, userId: string) {
  if (request.assignedFixerId !== userId) {
    throw new ApiError("Yêu cầu này chưa được giao cho bạn.", 403);
  }
}
