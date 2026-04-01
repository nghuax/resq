// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import {
  appendStatusLog,
  calculateRequestAmounts,
  canCustomerCancel,
  cleanString,
  generateUniqueRequestCode,
  getCarRegistrationByVehicleId,
  getInvoiceByRequestId,
  getLatestEtaMinutes,
  getReviewByRequestId,
  getServiceTypeByKey,
  hydrateRequest,
  normalizeDoc,
  nowTs,
  sortCreatedDesc,
} from "./lib/helpers";

export const listVehiclesForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const sorted = [...vehicles].sort((left, right) => {
      if (left.isDefault === right.isDefault) {
        return right.createdAt - left.createdAt;
      }

      return Number(right.isDefault) - Number(left.isDefault);
    });

    return Promise.all(
      sorted.map(async (vehicle) => ({
        ...normalizeDoc(vehicle),
        carRegistration: normalizeDoc(
          await getCarRegistrationByVehicleId(ctx, vehicle._id),
        ),
      })),
    );
  },
});

export const createVehicleForUser = mutation({
  args: {
    userId: v.id("users"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const input = args.input as any;
    const timestamp = nowTs();

    if (input.isDefault) {
      const existingVehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      await Promise.all(
        existingVehicles.map((vehicle) =>
          ctx.db.patch(vehicle._id, {
            isDefault: false,
            updatedAt: timestamp,
          }),
        ),
      );
    }

    const vehicleId = await ctx.db.insert("vehicles", {
      userId: args.userId,
      vehicleType: input.vehicleType,
      brand: input.brand,
      model: input.model,
      licensePlate: input.licensePlate,
      year: input.year ?? undefined,
      fuelType: input.fuelType,
      notes: cleanString(input.notes),
      isDefault: Boolean(input.isDefault),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (input.vehicleType === "car" && input.carRegistration) {
      await ctx.db.insert("carRegistrationDetails", {
        vehicleId,
        registrationNumber: cleanString(input.carRegistration.registrationNumber),
        ownerName: cleanString(input.carRegistration.ownerName),
        registrationProvinceCity: cleanString(
          input.carRegistration.registrationProvinceCity,
        ),
        inspectionExpiryDate: input.carRegistration.inspectionExpiryDate
          ? new Date(input.carRegistration.inspectionExpiryDate).getTime()
          : undefined,
        chassisNumber: cleanString(input.carRegistration.chassisNumber),
        engineNumber: cleanString(input.carRegistration.engineNumber),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    const vehicle = await ctx.db.get(vehicleId);
    return {
      ...normalizeDoc(vehicle),
      carRegistration: normalizeDoc(
        await getCarRegistrationByVehicleId(ctx, vehicleId),
      ),
    };
  },
});

export const updateCarRegistrationForVehicle = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const input = args.input as any;
    const timestamp = nowTs();
    const vehicle = await ctx.db.get(args.vehicleId);

    if (!vehicle || vehicle.userId !== args.userId) {
      throw new Error("Không tìm thấy phương tiện.");
    }

    if (vehicle.vehicleType !== "car") {
      throw new Error("Chỉ ô tô mới có thông tin đăng ký.");
    }

    const existing = await getCarRegistrationByVehicleId(ctx, args.vehicleId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        registrationNumber: cleanString(input.registrationNumber),
        ownerName: cleanString(input.ownerName),
        registrationProvinceCity: cleanString(input.registrationProvinceCity),
        inspectionExpiryDate: input.inspectionExpiryDate
          ? new Date(input.inspectionExpiryDate).getTime()
          : undefined,
        chassisNumber: cleanString(input.chassisNumber),
        engineNumber: cleanString(input.engineNumber),
        updatedAt: timestamp,
      });

      return normalizeDoc(await ctx.db.get(existing._id));
    }

    const createdId = await ctx.db.insert("carRegistrationDetails", {
      vehicleId: args.vehicleId,
      registrationNumber: cleanString(input.registrationNumber),
      ownerName: cleanString(input.ownerName),
      registrationProvinceCity: cleanString(input.registrationProvinceCity),
      inspectionExpiryDate: input.inspectionExpiryDate
        ? new Date(input.inspectionExpiryDate).getTime()
        : undefined,
      chassisNumber: cleanString(input.chassisNumber),
      engineNumber: cleanString(input.engineNumber),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return normalizeDoc(await ctx.db.get(createdId));
  },
});

export const listAddressesForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const addresses = await ctx.db
      .query("savedAddresses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return [...addresses]
      .sort((left, right) => {
        if (left.isDefault === right.isDefault) {
          return right.createdAt - left.createdAt;
        }

        return Number(right.isDefault) - Number(left.isDefault);
      })
      .map((address) => normalizeDoc(address));
  },
});

export const createAddressForUser = mutation({
  args: {
    userId: v.id("users"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const input = args.input as any;
    const timestamp = nowTs();

    if (input.isDefault) {
      const existing = await ctx.db
        .query("savedAddresses")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();

      await Promise.all(
        existing.map((address) =>
          ctx.db.patch(address._id, {
            isDefault: false,
            updatedAt: timestamp,
          }),
        ),
      );
    }

    const addressId = await ctx.db.insert("savedAddresses", {
      userId: args.userId,
      label: input.label,
      addressLine: input.addressLine,
      ward: input.ward,
      district: input.district,
      cityProvince: input.cityProvince,
      landmark: cleanString(input.landmark),
      latitude: input.latitude,
      longitude: input.longitude,
      isDefault: Boolean(input.isDefault),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return normalizeDoc(await ctx.db.get(addressId));
  },
});

export const getCustomerDashboardData = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const [vehicles, addresses, requests] = await Promise.all([
      ctx.db.query("vehicles").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db
        .query("savedAddresses")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db.query("requests").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect(),
    ]);

    const sortedRequests = sortCreatedDesc(requests);
    const activeRequestDoc =
      sortedRequests.find(
        (request) => !["completed", "cancelled"].includes(request.status),
      ) ?? null;

    return {
      vehicleCount: vehicles.length,
      addressCount: addresses.length,
      requests: await Promise.all(
        sortedRequests.slice(0, 5).map((request) => hydrateRequest(ctx, request)),
      ),
      activeRequest: activeRequestDoc
        ? await hydrateRequest(ctx, activeRequestDoc)
        : null,
    };
  },
});

export const listRequestsForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = sortCreatedDesc(
      await ctx.db.query("requests").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect(),
    );

    return Promise.all(requests.map((request) => hydrateRequest(ctx, request)));
  },
});

export const getActiveRequestForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = sortCreatedDesc(
      await ctx.db.query("requests").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect(),
    );

    const activeRequest =
      requests.find((request) => !["completed", "cancelled"].includes(request.status)) ??
      null;

    return activeRequest ? hydrateRequest(ctx, activeRequest) : null;
  },
});

export const createRequestForUser = mutation({
  args: {
    userId: v.id("users"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const input = args.input as any;
    const timestamp = nowTs();
    const vehicle = await ctx.db.get(input.vehicleId);

    if (!vehicle || vehicle.userId !== args.userId) {
      throw new Error("Phương tiện không hợp lệ.");
    }

    const serviceType = await getServiceTypeByKey(ctx, input.serviceTypeKey);

    if (!serviceType || !serviceType.isActive) {
      throw new Error("Dịch vụ không khả dụng.");
    }

    let savedAddressId = input.location.savedAddressId as string | undefined;
    const address = savedAddressId ? await ctx.db.get(savedAddressId) : null;

    if (savedAddressId && (!address || address.userId !== args.userId)) {
      throw new Error("Địa chỉ đã chọn không hợp lệ.");
    }

    if (input.location.saveAsAddress && !savedAddressId) {
      savedAddressId = await ctx.db.insert("savedAddresses", {
        userId: args.userId,
        label: input.location.saveLabel || input.location.label,
        addressLine: input.location.addressLine,
        ward: input.location.ward,
        district: input.location.district,
        cityProvince: input.location.cityProvince,
        landmark: cleanString(input.location.landmark),
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        isDefault: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    const amounts = calculateRequestAmounts({
      serviceFeeVnd: serviceType.basePriceVnd,
      litersRequested: input.fuelDetails?.litersRequested,
      fuelPricePerLiterVnd:
        input.serviceTypeKey === "refill_diesel" ? 24000 : 23000,
    });

    const requestId = await ctx.db.insert("requests", {
      requestCode: await generateUniqueRequestCode(ctx),
      userId: args.userId,
      vehicleId: vehicle._id,
      savedAddressId: savedAddressId ?? undefined,
      serviceTypeId: serviceType._id,
      status: "submitted",
      note: cleanString(input.note),
      contactPhone: input.contactPhone,
      scheduledAt: input.scheduledAt
        ? new Date(input.scheduledAt).getTime()
        : undefined,
      locationLabel: input.location.label,
      addressLine: input.location.addressLine,
      ward: input.location.ward,
      district: input.location.district,
      cityProvince: input.location.cityProvince,
      landmark: cleanString(input.location.landmark),
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      priceEstimateVnd: amounts.totalVnd,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (input.fuelDetails) {
      await ctx.db.insert("requestFuelDetails", {
        requestId,
        fuelType: input.fuelDetails.fuelType,
        litersRequested: input.fuelDetails.litersRequested,
        preferredGrade: cleanString(input.fuelDetails.preferredGrade),
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    if (input.photoNames?.length) {
      await Promise.all(
        input.photoNames.map((fileName: string) =>
          ctx.db.insert("requestPhotos", {
            requestId,
            fileName,
            createdAt: timestamp,
          }),
        ),
      );
    }

    await appendStatusLog(ctx, {
      requestId,
      status: "submitted",
      actorUserId: args.userId,
      descriptionVi: "ResQ đã nhận yêu cầu và đang bắt đầu điều phối.",
      createdAt: timestamp,
    });

    await ctx.db.insert("invoices", {
      requestId,
      serviceFeeVnd: amounts.serviceFeeVnd,
      fuelCostVnd: amounts.fuelCostVnd,
      extraChargesVnd: amounts.extraChargesVnd,
      totalVnd: amounts.totalVnd,
      paymentStatus: "pending",
      issuedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return hydrateRequest(ctx, await ctx.db.get(requestId));
  },
});

export const getRequestForUser = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    if (request.userId !== args.userId) {
      throw new Error("Bạn không có quyền truy cập yêu cầu này.");
    }

    return hydrateRequest(ctx, request);
  },
});

export const getRequestById = query({
  args: {
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    return hydrateRequest(ctx, request);
  },
});

export const getTrackingForUser = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    const detail = await hydrateRequest(ctx, request);

    return {
      request: detail,
      etaMinutes: getLatestEtaMinutes(detail ?? {}),
    };
  },
});

export const cancelRequestForUser = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    if (!canCustomerCancel(request.status)) {
      throw new Error("Yêu cầu này không còn có thể hủy.");
    }

    const timestamp = nowTs();

    await ctx.db.patch(request._id, {
      status: "cancelled",
      cancelReason: cleanString(args.reason),
      cancelledAt: timestamp,
      updatedAt: timestamp,
    });

    await appendStatusLog(ctx, {
      requestId: request._id,
      status: "cancelled",
      actorUserId: args.userId,
      descriptionVi: args.reason || "Khách hàng đã hủy yêu cầu.",
      createdAt: timestamp,
    });

    return hydrateRequest(ctx, await ctx.db.get(request._id));
  },
});

export const getPaymentSummaryForUser = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    const detail = await hydrateRequest(ctx, request);

    if (!detail?.invoice) {
      throw new Error("Chưa có hóa đơn cho yêu cầu này.");
    }

    return {
      request: detail,
      invoice: detail.invoice,
      latestPayment: detail.payments[0] ?? null,
    };
  },
});

export const payForRequest = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    const invoice = await getInvoiceByRequestId(ctx, request._id);

    if (!invoice) {
      throw new Error("Chưa có hóa đơn để thanh toán.");
    }

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
      .collect();

    const paidPayment = payments.find((payment) => payment.status === "paid");
    const timestamp = nowTs();

    if (!paidPayment) {
      await ctx.db.insert("payments", {
        requestId: request._id,
        invoiceId: invoice._id,
        amountVnd: invoice.totalVnd,
        method: args.method as any,
        status: "paid",
        referenceCode: `PAY-${timestamp}`,
        providerName: "ResQ MockPay",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    await ctx.db.patch(invoice._id, {
      paymentStatus: "paid",
      paidAt: timestamp,
      updatedAt: timestamp,
    });

    if (!request.finalPriceVnd) {
      await ctx.db.patch(request._id, {
        finalPriceVnd: invoice.totalVnd,
        updatedAt: timestamp,
      });
    }

    return hydrateRequest(ctx, await ctx.db.get(request._id));
  },
});

export const getInvoiceForUser = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    const detail = await hydrateRequest(ctx, request);

    if (!detail?.invoice) {
      throw new Error("Không tìm thấy hóa đơn.");
    }

    return detail;
  },
});

export const createReviewForUser = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
    input: v.any(),
  },
  handler: async (ctx, args) => {
    const input = args.input as any;
    const request = await ctx.db.get(args.requestId);

    if (!request || request.userId !== args.userId) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    if (request.status !== "completed") {
      throw new Error("Chỉ có thể đánh giá yêu cầu đã hoàn thành.");
    }

    const existingReview = await getReviewByRequestId(ctx, request._id);

    if (existingReview) {
      throw new Error("Yêu cầu này đã được đánh giá trước đó.");
    }

    const timestamp = nowTs();
    const reviewId = await ctx.db.insert("reviews", {
      requestId: request._id,
      userId: args.userId,
      overallRating: input.overallRating,
      professionalismRating: input.professionalismRating,
      arrivalSpeedRating: input.arrivalSpeedRating,
      serviceQualityRating: input.serviceQualityRating,
      communicationRating: input.communicationRating,
      comment: cleanString(input.comment),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return normalizeDoc(await ctx.db.get(reviewId));
  },
});
