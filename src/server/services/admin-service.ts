import { ApiError } from "@/lib/api-response";
import { coerceOptionalString } from "@/lib/utils";
import {
  assignFixerSchema,
  updateAdminRequestStatusSchema,
} from "@/schemas/admin";
import { getDb } from "@/server/db/prisma";
import {
  appendStatusLog,
  findRequestById,
  requestDetailsInclude,
} from "@/server/services/request-shared";

export async function listAdminRequests(status?: string) {
  const db = await getDb();

  return db.request.findMany({
    where: status ? { status: status as never } : undefined,
    include: requestDetailsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listFixerCandidates() {
  const db = await getDb();

  return db.user.findMany({
    where: {
      role: "fixer",
      isActive: true,
    },
    include: {
      fixerProfile: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function assignFixerToRequest(
  requestId: string,
  rawInput: unknown,
  actorUserId: string,
) {
  const input = assignFixerSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  if (["completed", "cancelled"].includes(request.status)) {
    throw new ApiError("Không thể gán fixer cho yêu cầu đã kết thúc.", 400);
  }

  const fixer = await db.user.findFirst({
    where: {
      id: input.fixerUserId,
      role: "fixer",
      isActive: true,
    },
    include: {
      fixerProfile: true,
    },
  });

  if (!fixer) {
    throw new ApiError("Fixer không hợp lệ.", 404);
  }

  return db.$transaction(async (tx) => {
    await tx.request.update({
      where: {
        id: requestId,
      },
      data: {
        assignedFixerId: fixer.id,
        status: "fixer_matched",
      },
    });

    await appendStatusLog(tx, {
      requestId,
      status: "fixer_matched",
      actorUserId,
      descriptionVi: `${fixer.name} đã được gán cho yêu cầu này.`,
    });

    return tx.request.findUnique({
      where: {
        id: requestId,
      },
      include: requestDetailsInclude,
    });
  });
}

export async function updateRequestStatusByAdmin(
  requestId: string,
  rawInput: unknown,
  actorUserId: string,
) {
  const input = updateAdminRequestStatusSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  if (
    ["completed", "cancelled"].includes(request.status) &&
    request.status === input.status
  ) {
    return request;
  }

  return db.$transaction(async (tx) => {
    await tx.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: input.status,
        cancelledAt: input.status === "cancelled" ? new Date() : undefined,
        completedAt: input.status === "completed" ? new Date() : undefined,
        cancelReason:
          input.status === "cancelled" ? coerceOptionalString(input.note) : null,
        finalPriceVnd:
          input.status === "completed"
            ? request.finalPriceVnd ?? request.invoice?.totalVnd ?? request.priceEstimateVnd
            : request.finalPriceVnd,
      },
    });

    await appendStatusLog(tx, {
      requestId,
      status: input.status,
      actorUserId,
      descriptionVi: input.note,
      etaMinutes: input.etaMinutes,
    });

    return tx.request.findUnique({
      where: {
        id: requestId,
      },
      include: requestDetailsInclude,
    });
  });
}
