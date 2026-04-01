import { ApiError } from "@/lib/api-response";
import { cancelRequestSchema, createRequestSchema } from "@/schemas/request";
import { payRequestSchema } from "@/schemas/payment";
import { reviewFormSchema } from "@/schemas/review";
import { api, asConvexId, convexMutation, convexQuery } from "@/server/db/convex";
import type {
  PaymentSummaryView,
  RequestView,
  RequestWithInvoiceView,
} from "@/server/services/view-models";

export async function listRequestsForUser(userId: string): Promise<RequestView[]> {
  return convexQuery<RequestView[]>(api.customer.listRequestsForUser, {
    userId: asConvexId<"users">(userId),
  });
}

export async function getActiveRequestForUser(
  userId: string,
): Promise<RequestView | null> {
  return convexQuery<RequestView | null>(api.customer.getActiveRequestForUser, {
    userId: asConvexId<"users">(userId),
  });
}

export async function createRequestForUser(userId: string, rawInput: unknown) {
  const input = createRequestSchema.parse(rawInput);

  try {
    return await convexMutation(api.customer.createRequestForUser, {
      userId: asConvexId<"users">(userId),
      input,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể tạo yêu cầu.",
          400,
        );
  }
}

export async function getRequestForUser(
  userId: string,
  requestId: string,
): Promise<RequestView> {
  return convexQuery<RequestView>(api.customer.getRequestForUser, {
    userId: asConvexId<"users">(userId),
    requestId: asConvexId<"requests">(requestId),
  });
}

export async function getTrackingForUser(
  userId: string,
  requestId: string,
): Promise<RequestView> {
  return convexQuery<RequestView>(api.customer.getTrackingForUser, {
    userId: asConvexId<"users">(userId),
    requestId: asConvexId<"requests">(requestId),
  });
}

export async function cancelRequestForUser(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = cancelRequestSchema.parse(rawInput);

  try {
    return await convexMutation(api.customer.cancelRequestForUser, {
      userId: asConvexId<"users">(userId),
      requestId: asConvexId<"requests">(requestId),
      reason: input.reason,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể hủy yêu cầu.",
          400,
        );
  }
}

export async function getPaymentSummaryForUser(userId: string, requestId: string) {
  return convexQuery<PaymentSummaryView>(api.customer.getPaymentSummaryForUser, {
    userId: asConvexId<"users">(userId),
    requestId: asConvexId<"requests">(requestId),
  });
}

export async function payForRequest(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = payRequestSchema.parse(rawInput);

  try {
    return await convexMutation(api.customer.payForRequest, {
      userId: asConvexId<"users">(userId),
      requestId: asConvexId<"requests">(requestId),
      method: input.method,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể thanh toán yêu cầu.",
          400,
        );
  }
}

export async function getInvoiceForUser(
  userId: string,
  requestId: string,
): Promise<RequestWithInvoiceView> {
  return convexQuery<RequestWithInvoiceView>(api.customer.getInvoiceForUser, {
    userId: asConvexId<"users">(userId),
    requestId: asConvexId<"requests">(requestId),
  });
}

export async function createReviewForUser(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = reviewFormSchema.parse(rawInput);

  try {
    return await convexMutation(api.customer.createReviewForUser, {
      userId: asConvexId<"users">(userId),
      requestId: asConvexId<"requests">(requestId),
      input,
    });
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(
          error instanceof Error ? error.message : "Không thể gửi đánh giá.",
          400,
        );
  }
}
