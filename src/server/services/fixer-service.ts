import { ApiError } from "@/lib/api-response";
import { updateFixerJobStatusSchema } from "@/schemas/fixer";
import { getDb } from "@/server/db/prisma";
import {
  appendStatusLog,
  ensureFixerOwnsRequest,
  findRequestById,
  requestDetailsInclude,
} from "@/server/services/request-shared";

export async function listFixerJobs(userId: string) {
  const db = await getDb();

  return db.request.findMany({
    where: {
      assignedFixerId: userId,
    },
    include: requestDetailsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getFixerJobDetail(userId: string, requestId: string) {
  const request = await findRequestById(requestId);
  ensureFixerOwnsRequest(request, userId);
  return request;
}

export async function updateFixerJobStatus(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = updateFixerJobStatusSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  ensureFixerOwnsRequest(request, userId);

  if (request.status === "cancelled") {
    throw new ApiError("Không thể cập nhật yêu cầu đã hủy.", 400);
  }

  return db.$transaction(async (tx) => {
    await tx.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: input.status,
        completedAt: input.status === "completed" ? new Date() : undefined,
        finalPriceVnd:
          input.status === "completed"
            ? request.finalPriceVnd ?? request.invoice?.totalVnd ?? request.priceEstimateVnd
            : request.finalPriceVnd,
      },
    });

    await appendStatusLog(tx, {
      requestId,
      status: input.status,
      actorUserId: userId,
      descriptionVi: input.note,
      etaMinutes: input.etaMinutes,
    });

    if (input.status === "completed") {
      await tx.fixerProfile.updateMany({
        where: {
          userId,
        },
        data: {
          totalJobs: {
            increment: 1,
          },
        },
      });
    }

    return tx.request.findUnique({
      where: {
        id: requestId,
      },
      include: requestDetailsInclude,
    });
  });
}
