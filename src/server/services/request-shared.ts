import type { Prisma, PrismaClient, RequestStatus } from "@prisma/client";

import { ApiError } from "@/lib/api-response";
import { generateRequestCode } from "@/lib/utils";
import { getDb } from "@/server/db/prisma";

export const requestDetailsInclude = {
  user: true,
  vehicle: {
    include: {
      carRegistration: true,
    },
  },
  savedAddress: true,
  serviceType: true,
  assignedFixer: {
    include: {
      fixerProfile: true,
    },
  },
  fuelDetails: true,
  photos: true,
  statusLogs: {
    orderBy: {
      createdAt: "asc",
    },
  },
  invoice: true,
  payments: {
    orderBy: {
      createdAt: "desc",
    },
  },
  review: true,
} as const satisfies Prisma.RequestInclude;

export type RequestDetails = Prisma.RequestGetPayload<{
  include: typeof requestDetailsInclude;
}>;

type DbLike = PrismaClient | Prisma.TransactionClient;

const STATUS_TITLES: Record<RequestStatus, string> = {
  submitted: "Yêu cầu đã được gửi",
  processing: "Đang xử lý yêu cầu",
  fixer_matched: "Đã ghép kỹ thuật viên",
  fixer_on_the_way: "Kỹ thuật viên đang đến",
  arrived: "Kỹ thuật viên đã đến",
  in_progress: "Đang xử lý tại hiện trường",
  completed: "Yêu cầu đã hoàn thành",
  cancelled: "Yêu cầu đã bị hủy",
};

export async function generateUniqueRequestCode(db: DbLike) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateRequestCode();
    const existing = await db.request.findUnique({
      where: {
        requestCode: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError("Không thể tạo mã yêu cầu duy nhất.", 500);
}

export function calculateRequestAmounts(options: {
  serviceFeeVnd: number;
  litersRequested?: number | null;
  fuelPricePerLiterVnd?: number;
  extraChargesVnd?: number;
}) {
  const fuelCostVnd = Math.round(
    (options.litersRequested ?? 0) * (options.fuelPricePerLiterVnd ?? 24000),
  );
  const extraChargesVnd = options.extraChargesVnd ?? 0;
  const totalVnd = options.serviceFeeVnd + fuelCostVnd + extraChargesVnd;

  return {
    serviceFeeVnd: options.serviceFeeVnd,
    fuelCostVnd,
    extraChargesVnd,
    totalVnd,
  };
}

export async function appendStatusLog(
  db: DbLike,
  input: {
    requestId: string;
    status: RequestStatus;
    actorUserId?: string | null;
    descriptionVi?: string | null;
    etaMinutes?: number | null;
  },
) {
  return db.requestStatusLog.create({
    data: {
      requestId: input.requestId,
      status: input.status,
      titleVi: STATUS_TITLES[input.status],
      descriptionVi: input.descriptionVi ?? undefined,
      actorUserId: input.actorUserId ?? undefined,
      etaMinutes: input.etaMinutes ?? undefined,
    },
  });
}

export async function findRequestById(requestId: string) {
  const db = await getDb();

  const request = await db.request.findUnique({
    where: { id: requestId },
    include: requestDetailsInclude,
  });

  if (!request) {
    throw new ApiError("Không tìm thấy yêu cầu.", 404);
  }

  return request;
}

export function canCustomerCancel(status: RequestStatus) {
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
