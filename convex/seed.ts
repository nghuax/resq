// @ts-nocheck
import { mutation } from "./_generated/server";

const serviceCatalog = [
  ["flat_tire", "Vá lốp khẩn cấp", "Flat tire repair", "Hỗ trợ vá hoặc thay lốp tại chỗ cho xe máy và ô tô.", 120000, false],
  ["battery_jump_start", "Kích bình", "Battery jump start", "Khởi động lại xe khi ắc quy yếu hoặc hết điện.", 150000, false],
  ["battery_replacement", "Thay ắc quy", "Battery replacement", "Thay ắc quy tận nơi với báo giá minh bạch.", 350000, false],
  ["refill_gasoline", "Tiếp xăng", "Refill gasoline", "Tiếp xăng tận nơi với số lít linh hoạt.", 90000, true],
  ["refill_diesel", "Tiếp dầu diesel", "Refill diesel", "Tiếp dầu diesel cho xe tải, van và xe cá nhân.", 100000, true],
  ["engine_issue", "Sự cố động cơ", "Engine issue", "Kiểm tra sơ bộ, hỗ trợ xử lý lỗi động cơ ngay tại điểm dừng.", 220000, false],
  ["brake_issue", "Sự cố phanh", "Brake issue", "Đánh giá nhanh, hỗ trợ phanh bó, thiếu dầu hoặc mất lực phanh.", 230000, false],
  ["oil_change", "Thay nhớt", "Oil change", "Thay nhớt lưu động cho xe máy, ô tô và xe tải nhẹ.", 180000, false],
  ["electrical_issue", "Lỗi điện", "Electrical issue", "Xử lý các lỗi điện cơ bản, chập chờn, cầu chì hoặc dây nguồn.", 200000, false],
  ["tow_request", "Kéo xe", "Tow request", "Điều phối kéo xe về garage hoặc điểm an toàn gần nhất.", 500000, false],
  ["roadside_help", "Cứu hộ tổng quát", "Roadside help", "Dành cho các tình huống chưa xác định rõ lỗi hoặc cần hỗ trợ khẩn cấp.", 160000, false],
] as const;

async function clearTable(ctx: any, tableName: string) {
  const docs = await ctx.db.query(tableName).collect();
  await Promise.all(docs.map((doc: any) => ctx.db.delete(doc._id)));
}

export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const ninetyMinutesAgo = now - 90 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const twoDaysAgoPlus20 = twoDaysAgo + 20 * 60 * 1000;
    const twoDaysAgoPlus45 = twoDaysAgo + 45 * 60 * 1000;
    const twoDaysAgoPlus70 = twoDaysAgo + 70 * 60 * 1000;

    for (const tableName of [
      "notifications",
      "reviews",
      "payments",
      "invoices",
      "requestStatusLogs",
      "requestPhotos",
      "requestFuelDetails",
      "requests",
      "fixerServiceTypes",
      "fixerProfiles",
      "carRegistrationDetails",
      "vehicles",
      "savedAddresses",
      "pricingRules",
      "serviceAreaRules",
      "serviceTypes",
      "userSessions",
      "users",
    ]) {
      await clearTable(ctx, tableName);
    }

    const [adminId, fixerId, customerOneId, customerTwoId] = await Promise.all([
      ctx.db.insert("users", {
        phone: "0900000001",
        name: "Quản trị ResQ",
        role: "admin",
        locale: "vi",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        phone: "0900000002",
        name: "Nguyễn Minh Khoa",
        role: "fixer",
        locale: "vi",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        phone: "0900000003",
        name: "Trần Anh Duy",
        role: "customer",
        locale: "vi",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("users", {
        phone: "0900000004",
        name: "Lê Thu Hà",
        role: "customer",
        locale: "vi",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    await Promise.all([
      ctx.db.insert("userSessions", {
        userId: adminId,
        tokenId: "seed-admin-token",
        status: "active",
        expiresAt: now + 7 * 24 * 60 * 60 * 1000,
        createdAt: now,
      }),
      ctx.db.insert("userSessions", {
        userId: fixerId,
        tokenId: "seed-fixer-token",
        status: "active",
        expiresAt: now + 7 * 24 * 60 * 60 * 1000,
        createdAt: now,
      }),
    ]);

    const serviceIds = new Map<string, string>();
    for (const [key, nameVi, nameEn, descriptionVi, basePriceVnd, isFuelService] of serviceCatalog) {
      const serviceId = await ctx.db.insert("serviceTypes", {
        key,
        nameVi,
        nameEn,
        descriptionVi,
        basePriceVnd,
        isFuelService,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      serviceIds.set(key, serviceId);
    }

    await Promise.all([
      ctx.db.insert("serviceAreaRules", {
        cityProvince: "TP. Hồ Chí Minh",
        district: "Quận 1",
        isActive: true,
        notes: "Vùng phủ nhanh nội đô trung tâm.",
        responseWindowMinutes: 20,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("serviceAreaRules", {
        cityProvince: "TP. Hồ Chí Minh",
        district: "Quận 7",
        isActive: true,
        notes: "Ưu tiên cứu hộ buổi tối và cuối tuần.",
        responseWindowMinutes: 25,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    for (const [key, , , , basePriceVnd, isFuelService] of serviceCatalog) {
      await ctx.db.insert("pricingRules", {
        serviceTypeId: serviceIds.get(key)!,
        cityProvince: "TP. Hồ Chí Minh",
        basePriceVnd,
        fuelPricePerLiterVnd: isFuelService ? 24000 : undefined,
        nightSurchargeVnd: 30000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const fixerProfileId = await ctx.db.insert("fixerProfiles", {
      userId: fixerId,
      displayName: "Khoa Rescue",
      phone: "0900000002",
      cityProvince: "TP. Hồ Chí Minh",
      districts: ["Quận 1", "Quận 4", "Quận 7", "Bình Thạnh"],
      vehicleTypeSupport: ["motorbike", "car", "truck", "van"],
      ratingAverage: 4.8,
      totalJobs: 126,
      isAvailable: true,
      createdAt: now,
      updatedAt: now,
    });

    for (const serviceKey of [
      "flat_tire",
      "battery_jump_start",
      "battery_replacement",
      "refill_gasoline",
      "refill_diesel",
      "roadside_help",
      "tow_request",
    ]) {
      await ctx.db.insert("fixerServiceTypes", {
        fixerProfileId,
        serviceTypeId: serviceIds.get(serviceKey)!,
        createdAt: now,
      });
    }

    const carVehicleId = await ctx.db.insert("vehicles", {
      userId: customerOneId,
      vehicleType: "car",
      brand: "Toyota",
      model: "Vios",
      licensePlate: "51H-123.45",
      year: 2021,
      fuelType: "gasoline",
      notes: "Xe gia đình, ưu tiên cứu hộ tại nhà và văn phòng.",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
    const bikeVehicleId = await ctx.db.insert("vehicles", {
      userId: customerOneId,
      vehicleType: "motorbike",
      brand: "Honda",
      model: "SH 150i",
      licensePlate: "59X3-456.78",
      year: 2022,
      fuelType: "gasoline",
      notes: "Xe đi làm hằng ngày.",
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });
    const truckVehicleId = await ctx.db.insert("vehicles", {
      userId: customerTwoId,
      vehicleType: "truck",
      brand: "Hyundai",
      model: "Porter H150",
      licensePlate: "51C-998.88",
      year: 2020,
      fuelType: "diesel",
      notes: "Xe giao hàng nội thành.",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("carRegistrationDetails", {
      vehicleId: carVehicleId,
      registrationNumber: "079321045",
      ownerName: "Trần Anh Duy",
      registrationProvinceCity: "TP. Hồ Chí Minh",
      inspectionExpiryDate: now + 180 * 24 * 60 * 60 * 1000,
      chassisNumber: "RL4BAX12345678901",
      engineNumber: "1NRF1234567",
      createdAt: now,
      updatedAt: now,
    });

    const homeAddressId = await ctx.db.insert("savedAddresses", {
      userId: customerOneId,
      label: "Nhà riêng",
      addressLine: "12 Nguyễn Hữu Cảnh",
      ward: "Phường 22",
      district: "Bình Thạnh",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Gần Landmark 81",
      latitude: 10.7944,
      longitude: 106.7218,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
    const officeAddressId = await ctx.db.insert("savedAddresses", {
      userId: customerOneId,
      label: "Văn phòng",
      addressLine: "99 Nguyễn Thị Thập",
      ward: "Tân Phú",
      district: "Quận 7",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Khu Him Lam",
      latitude: 10.7388,
      longitude: 106.7067,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });
    const warehouseAddressId = await ctx.db.insert("savedAddresses", {
      userId: customerTwoId,
      label: "Kho hàng",
      addressLine: "45 Quốc lộ 13",
      ward: "Hiệp Bình Phước",
      district: "Thủ Đức",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Cạnh ngã tư Bình Phước",
      latitude: 10.8458,
      longitude: 106.7424,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });

    const activeBatteryRequestId = await ctx.db.insert("requests", {
      requestCode: "RSQ-250401-301",
      userId: customerOneId,
      vehicleId: carVehicleId,
      savedAddressId: officeAddressId,
      serviceTypeId: serviceIds.get("battery_jump_start")!,
      assignedFixerId: fixerId,
      status: "fixer_on_the_way",
      note: "Xe để dưới hầm, đề máy không lên.",
      contactPhone: "0900000003",
      locationLabel: "Văn phòng Quận 7",
      addressLine: "99 Nguyễn Thị Thập",
      ward: "Tân Phú",
      district: "Quận 7",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Hầm B1, block C",
      latitude: 10.7388,
      longitude: 106.7067,
      priceEstimateVnd: 180000,
      createdAt: ninetyMinutesAgo,
      updatedAt: now,
    });

    const completedFlatTireRequestId = await ctx.db.insert("requests", {
      requestCode: "RSQ-250330-184",
      userId: customerTwoId,
      vehicleId: truckVehicleId,
      savedAddressId: warehouseAddressId,
      serviceTypeId: serviceIds.get("flat_tire")!,
      assignedFixerId: fixerId,
      status: "completed",
      note: "Lốp sau bị cán đinh, cần vá nhanh để giao hàng tiếp.",
      contactPhone: "0900000004",
      locationLabel: "Kho hàng Thủ Đức",
      addressLine: "45 Quốc lộ 13",
      ward: "Hiệp Bình Phước",
      district: "Thủ Đức",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Cổng số 2",
      latitude: 10.8458,
      longitude: 106.7424,
      priceEstimateVnd: 140000,
      finalPriceVnd: 140000,
      completedAt: twoDaysAgoPlus70,
      createdAt: twoDaysAgo,
      updatedAt: now,
    });

    const dieselRefillRequestId = await ctx.db.insert("requests", {
      requestCode: "RSQ-250401-412",
      userId: customerTwoId,
      vehicleId: truckVehicleId,
      savedAddressId: warehouseAddressId,
      serviceTypeId: serviceIds.get("refill_diesel")!,
      status: "processing",
      note: "Xe gần hết dầu, cần tiếp 8 lít để về kho.",
      contactPhone: "0900000004",
      locationLabel: "Tuyến Phạm Văn Đồng",
      addressLine: "Đối diện Gigamall",
      ward: "Hiệp Bình Chánh",
      district: "Thủ Đức",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "Bãi đỗ bên phải đường",
      latitude: 10.8271,
      longitude: 106.7211,
      priceEstimateVnd: 292000,
      createdAt: oneHourAgo,
      updatedAt: now,
    });

    await ctx.db.insert("requestFuelDetails", {
      requestId: dieselRefillRequestId,
      fuelType: "diesel",
      litersRequested: 8,
      preferredGrade: "DO 0.05S",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("requestPhotos", {
      requestId: completedFlatTireRequestId,
      fileName: "lop-sau-bi-dinh.jpg",
      caption: "Lốp sau bị cán đinh trước khi vá.",
      createdAt: now,
    });

    for (const log of [
      [activeBatteryRequestId, "submitted", "Yêu cầu đã được gửi", "ResQ đã nhận yêu cầu kích bình của bạn.", customerOneId, undefined, ninetyMinutesAgo],
      [activeBatteryRequestId, "processing", "Đang xử lý", "Hệ thống đang tìm fixer gần vị trí hiện tại.", adminId, undefined, ninetyMinutesAgo + 10 * 60 * 1000],
      [activeBatteryRequestId, "fixer_matched", "Đã ghép kỹ thuật viên", "Khoa Rescue nhận xử lý yêu cầu này.", adminId, undefined, ninetyMinutesAgo + 18 * 60 * 1000],
      [activeBatteryRequestId, "fixer_on_the_way", "Kỹ thuật viên đang đến", "Ước tính đến nơi sau 12 phút.", fixerId, 12, ninetyMinutesAgo + 24 * 60 * 1000],
      [completedFlatTireRequestId, "submitted", "Yêu cầu vá lốp đã được gửi", undefined, customerTwoId, undefined, twoDaysAgo],
      [completedFlatTireRequestId, "fixer_matched", "Đã ghép kỹ thuật viên", undefined, adminId, undefined, twoDaysAgoPlus20],
      [completedFlatTireRequestId, "in_progress", "Fixer đang xử lý", "Đang vá lốp và kiểm tra áp suất bánh còn lại.", fixerId, undefined, twoDaysAgoPlus45],
      [completedFlatTireRequestId, "completed", "Hoàn thành", "Khách đã xác nhận lốp hoạt động ổn định.", fixerId, undefined, twoDaysAgoPlus70],
      [dieselRefillRequestId, "submitted", "Yêu cầu tiếp dầu đã được gửi", undefined, customerTwoId, undefined, oneHourAgo],
      [dieselRefillRequestId, "processing", "Đang điều phối", "Ưu tiên fixer có thể tiếp diesel tại Thủ Đức.", adminId, 20, oneHourAgo + 8 * 60 * 1000],
    ] as const) {
      await ctx.db.insert("requestStatusLogs", {
        requestId: log[0],
        status: log[1],
        titleVi: log[2],
        descriptionVi: log[3],
        actorUserId: log[4],
        etaMinutes: log[5],
        createdAt: log[6],
      });
    }

    const activeBatteryInvoiceId = await ctx.db.insert("invoices", {
      requestId: activeBatteryRequestId,
      serviceFeeVnd: 180000,
      fuelCostVnd: 0,
      extraChargesVnd: 0,
      totalVnd: 180000,
      paymentStatus: "pending",
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    const completedFlatTireInvoiceId = await ctx.db.insert("invoices", {
      requestId: completedFlatTireRequestId,
      serviceFeeVnd: 140000,
      fuelCostVnd: 0,
      extraChargesVnd: 0,
      totalVnd: 140000,
      paymentStatus: "paid",
      issuedAt: twoDaysAgoPlus70,
      paidAt: twoDaysAgoPlus70,
      createdAt: now,
      updatedAt: now,
    });
    const dieselRefillInvoiceId = await ctx.db.insert("invoices", {
      requestId: dieselRefillRequestId,
      serviceFeeVnd: 100000,
      fuelCostVnd: 192000,
      extraChargesVnd: 0,
      totalVnd: 292000,
      paymentStatus: "pending",
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await Promise.all([
      ctx.db.insert("payments", {
        requestId: activeBatteryRequestId,
        invoiceId: activeBatteryInvoiceId,
        amountVnd: 180000,
        method: "cash",
        status: "pending",
        providerName: "ResQ Cash",
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("payments", {
        requestId: completedFlatTireRequestId,
        invoiceId: completedFlatTireInvoiceId,
        amountVnd: 140000,
        method: "ewallet",
        status: "paid",
        referenceCode: "EWALLET-RSQ-330184",
        providerName: "Ví DemoPay",
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("payments", {
        requestId: dieselRefillRequestId,
        invoiceId: dieselRefillInvoiceId,
        amountVnd: 292000,
        method: "bank_transfer",
        status: "pending",
        providerName: "Bank Transfer Placeholder",
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    await ctx.db.insert("reviews", {
      requestId: completedFlatTireRequestId,
      userId: customerTwoId,
      overallRating: 5,
      professionalismRating: 5,
      arrivalSpeedRating: 4,
      serviceQualityRating: 5,
      communicationRating: 5,
      comment: "Fixer đến đúng hẹn, làm việc gọn gàng và giải thích rất rõ.",
      createdAt: twoDaysAgoPlus70,
      updatedAt: twoDaysAgoPlus70,
    });

    await Promise.all([
      ctx.db.insert("notifications", {
        userId: customerOneId,
        requestId: activeBatteryRequestId,
        type: "request_update",
        channel: "app",
        titleVi: "Fixer đang đến",
        messageVi: "Khoa Rescue sẽ đến vị trí của bạn trong khoảng 12 phút.",
        isRead: false,
        createdAt: now,
      }),
      ctx.db.insert("notifications", {
        userId: customerTwoId,
        requestId: completedFlatTireRequestId,
        type: "payment",
        channel: "app",
        titleVi: "Thanh toán hoàn tất",
        messageVi: "Hóa đơn vá lốp RSQ-250330-184 đã được thanh toán thành công.",
        isRead: false,
        createdAt: now,
      }),
    ]);

    return {
      users: 4,
      services: serviceCatalog.length,
      requests: 3,
      vehicles: 3,
      addresses: 3,
      homeAddressId,
      bikeVehicleId,
    };
  },
});
