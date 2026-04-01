import type { PaymentMethod } from "@prisma/client";

import { ApiError } from "@/lib/api-response";
import { coerceOptionalString } from "@/lib/utils";
import {
  cancelRequestSchema,
  createRequestSchema,
} from "@/schemas/request";
import { reviewFormSchema } from "@/schemas/review";
import { payRequestSchema } from "@/schemas/payment";
import { getDb } from "@/server/db/prisma";
import {
  appendStatusLog,
  calculateRequestAmounts,
  canCustomerCancel,
  ensureCustomerOwnsRequest,
  findRequestById,
  generateUniqueRequestCode,
  getLatestEtaMinutes,
  requestDetailsInclude,
} from "@/server/services/request-shared";

export async function listRequestsForUser(userId: string) {
  const db = await getDb();

  return db.request.findMany({
    where: {
      userId,
    },
    include: requestDetailsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getActiveRequestForUser(userId: string) {
  const db = await getDb();

  return db.request.findFirst({
    where: {
      userId,
      status: {
        notIn: ["completed", "cancelled"],
      },
    },
    include: requestDetailsInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createRequestForUser(userId: string, rawInput: unknown) {
  const input = createRequestSchema.parse(rawInput);
  const db = await getDb();

  const [vehicle, serviceType, address] = await Promise.all([
    db.vehicle.findFirst({
      where: {
        id: input.vehicleId,
        userId,
      },
    }),
    db.serviceType.findUnique({
      where: {
        key: input.serviceTypeKey,
      },
    }),
    input.location.savedAddressId
      ? db.savedAddress.findFirst({
          where: {
            id: input.location.savedAddressId,
            userId,
          },
        })
      : Promise.resolve(null),
  ]);

  if (!vehicle) {
    throw new ApiError("Phương tiện không hợp lệ.", 404);
  }

  if (!serviceType || !serviceType.isActive) {
    throw new ApiError("Dịch vụ không khả dụng.", 404);
  }

  if (input.location.savedAddressId && !address) {
    throw new ApiError("Địa chỉ đã chọn không hợp lệ.", 404);
  }

  const amounts = calculateRequestAmounts({
    serviceFeeVnd: serviceType.basePriceVnd,
    litersRequested: input.fuelDetails?.litersRequested,
    fuelPricePerLiterVnd:
      input.serviceTypeKey === "refill_diesel" ? 24000 : 23000,
  });

  return db.$transaction(async (tx) => {
    let savedAddressId = input.location.savedAddressId;

    if (input.location.saveAsAddress && !savedAddressId) {
      const savedAddress = await tx.savedAddress.create({
        data: {
          userId,
          label: input.location.saveLabel || input.location.label,
          addressLine: input.location.addressLine,
          ward: input.location.ward,
          district: input.location.district,
          cityProvince: input.location.cityProvince,
          landmark: coerceOptionalString(input.location.landmark),
          latitude: input.location.latitude,
          longitude: input.location.longitude,
          isDefault: false,
        },
      });

      savedAddressId = savedAddress.id;
    }

    const requestCode = await generateUniqueRequestCode(tx);

    const request = await tx.request.create({
      data: {
        requestCode,
        userId,
        vehicleId: vehicle.id,
        savedAddressId,
        serviceTypeId: serviceType.id,
        note: coerceOptionalString(input.note),
        contactPhone: input.contactPhone,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        locationLabel: input.location.label,
        addressLine: input.location.addressLine,
        ward: input.location.ward,
        district: input.location.district,
        cityProvince: input.location.cityProvince,
        landmark: coerceOptionalString(input.location.landmark),
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        priceEstimateVnd: amounts.totalVnd,
      },
    });

    if (input.fuelDetails) {
      await tx.requestFuelDetails.create({
        data: {
          requestId: request.id,
          fuelType: input.fuelDetails.fuelType,
          litersRequested: input.fuelDetails.litersRequested,
          preferredGrade: coerceOptionalString(input.fuelDetails.preferredGrade),
        },
      });
    }

    if (input.photoNames?.length) {
      await tx.requestPhoto.createMany({
        data: input.photoNames.map((fileName) => ({
          requestId: request.id,
          fileName,
        })),
      });
    }

    await appendStatusLog(tx, {
      requestId: request.id,
      status: "submitted",
      actorUserId: userId,
      descriptionVi: "ResQ đã nhận yêu cầu và đang bắt đầu điều phối.",
    });

    await tx.invoice.create({
      data: {
        requestId: request.id,
        serviceFeeVnd: amounts.serviceFeeVnd,
        fuelCostVnd: amounts.fuelCostVnd,
        extraChargesVnd: amounts.extraChargesVnd,
        totalVnd: amounts.totalVnd,
        paymentStatus: "pending",
        issuedAt: new Date(),
      },
    });

    const detail = await tx.request.findUnique({
      where: {
        id: request.id,
      },
      include: requestDetailsInclude,
    });

    if (!detail) {
      throw new ApiError("Không thể tạo yêu cầu.", 500);
    }

    return detail;
  });
}

export async function getRequestForUser(userId: string, requestId: string) {
  const request = await findRequestById(requestId);
  ensureCustomerOwnsRequest(request, userId);
  return request;
}

export async function getTrackingForUser(userId: string, requestId: string) {
  const request = await getRequestForUser(userId, requestId);

  return {
    request,
    etaMinutes: getLatestEtaMinutes(request),
  };
}

export async function cancelRequestForUser(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = cancelRequestSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  ensureCustomerOwnsRequest(request, userId);

  if (!canCustomerCancel(request.status)) {
    throw new ApiError("Yêu cầu này không còn có thể hủy.", 400);
  }

  return db.$transaction(async (tx) => {
    await tx.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: "cancelled",
        cancelReason: coerceOptionalString(input.reason),
        cancelledAt: new Date(),
      },
    });

    await appendStatusLog(tx, {
      requestId,
      status: "cancelled",
      actorUserId: userId,
      descriptionVi: input.reason || "Khách hàng đã hủy yêu cầu.",
    });

    return tx.request.findUnique({
      where: {
        id: requestId,
      },
      include: requestDetailsInclude,
    });
  });
}

export async function getPaymentSummaryForUser(userId: string, requestId: string) {
  const request = await getRequestForUser(userId, requestId);

  if (!request.invoice) {
    throw new ApiError("Chưa có hóa đơn cho yêu cầu này.", 404);
  }

  return {
    request,
    invoice: request.invoice,
    latestPayment: request.payments[0] ?? null,
  };
}

export async function payForRequest(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = payRequestSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  ensureCustomerOwnsRequest(request, userId);

  if (!request.invoice) {
    throw new ApiError("Chưa có hóa đơn để thanh toán.", 404);
  }

  const invoice = request.invoice;

  return db.$transaction(async (tx) => {
    const existingPaidPayment = await tx.payment.findFirst({
      where: {
        requestId,
        status: "paid",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!existingPaidPayment) {
      await tx.payment.create({
        data: {
          requestId,
          invoiceId: invoice.id,
          amountVnd: invoice.totalVnd,
          method: input.method as PaymentMethod,
          status: "paid",
          referenceCode: `PAY-${Date.now()}`,
          providerName: "ResQ MockPay",
        },
      });
    }

    await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        paymentStatus: "paid",
        paidAt: new Date(),
      },
    });

    if (!request.finalPriceVnd) {
      await tx.request.update({
        where: {
          id: requestId,
        },
        data: {
          finalPriceVnd: invoice.totalVnd,
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

export async function getInvoiceForUser(userId: string, requestId: string) {
  const request = await getRequestForUser(userId, requestId);

  if (!request.invoice) {
    throw new ApiError("Không tìm thấy hóa đơn.", 404);
  }

  return request;
}

export async function createReviewForUser(
  userId: string,
  requestId: string,
  rawInput: unknown,
) {
  const input = reviewFormSchema.parse(rawInput);
  const db = await getDb();
  const request = await findRequestById(requestId);

  ensureCustomerOwnsRequest(request, userId);

  if (request.status !== "completed") {
    throw new ApiError("Chỉ có thể đánh giá yêu cầu đã hoàn thành.", 400);
  }

  if (request.review) {
    throw new ApiError("Yêu cầu này đã được đánh giá trước đó.", 400);
  }

  return db.review.create({
    data: {
      requestId,
      userId,
      overallRating: input.overallRating,
      professionalismRating: input.professionalismRating,
      arrivalSpeedRating: input.arrivalSpeedRating,
      serviceQualityRating: input.serviceQualityRating,
      communicationRating: input.communicationRating,
      comment: coerceOptionalString(input.comment),
    },
  });
}
