import type { PrismaClient } from "@prisma/client";
import {
  FuelType,
  PaymentMethod,
  PaymentStatus,
  RequestStatus,
  SessionStatus,
  UserRole,
  VehicleType,
} from "@prisma/client";

import { SERVICE_CATALOG } from "@/lib/constants";

export const seedIds = {
  users: {
    admin: "user_admin_resq",
    fixer: "user_fixer_khoa",
    customerOne: "user_customer_duy",
    customerTwo: "user_customer_ha",
  },
  fixerProfile: "fixer_profile_khoa",
  vehicles: {
    car: "vehicle_duy_car",
    bike: "vehicle_duy_bike",
    truck: "vehicle_ha_truck",
  },
  addresses: {
    home: "address_duy_home",
    office: "address_duy_office",
    warehouse: "address_ha_warehouse",
  },
  requests: {
    activeBattery: "request_active_battery",
    completedFlatTire: "request_completed_flattire",
    dieselRefill: "request_processing_diesel",
  },
  invoices: {
    activeBattery: "invoice_active_battery",
    completedFlatTire: "invoice_completed_flattire",
    dieselRefill: "invoice_processing_diesel",
  },
  reviews: {
    completedFlatTire: "review_completed_flattire",
  },
  sessions: {
    admin: "session_seed_admin",
    fixer: "session_seed_fixer",
  },
  serviceAreas: {
    hcmD1: "area_hcm_d1",
    hcmD7: "area_hcm_d7",
  },
};

export function getServiceId(key: string) {
  return `service_${key}`;
}

export function getPricingRuleId(key: string) {
  return `pricing_${key}`;
}

export async function seedDatabase(prisma: PrismaClient) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const twoDaysAgoPlus20 = new Date(twoDaysAgo.getTime() + 20 * 60 * 1000);
  const twoDaysAgoPlus45 = new Date(twoDaysAgo.getTime() + 45 * 60 * 1000);
  const twoDaysAgoPlus70 = new Date(twoDaysAgo.getTime() + 70 * 60 * 1000);

  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.requestStatusLog.deleteMany();
  await prisma.requestPhoto.deleteMany();
  await prisma.requestFuelDetails.deleteMany();
  await prisma.request.deleteMany();
  await prisma.fixerServiceType.deleteMany();
  await prisma.fixerProfile.deleteMany();
  await prisma.carRegistrationDetails.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.savedAddress.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.serviceAreaRule.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: seedIds.users.admin,
        phone: "0900000001",
        name: "Quản trị ResQ",
        role: UserRole.admin,
      },
      {
        id: seedIds.users.fixer,
        phone: "0900000002",
        name: "Nguyễn Minh Khoa",
        role: UserRole.fixer,
      },
      {
        id: seedIds.users.customerOne,
        phone: "0900000003",
        name: "Trần Anh Duy",
        role: UserRole.customer,
      },
      {
        id: seedIds.users.customerTwo,
        phone: "0900000004",
        name: "Lê Thu Hà",
        role: UserRole.customer,
      },
    ],
  });

  await prisma.userSession.createMany({
    data: [
      {
        id: seedIds.sessions.admin,
        userId: seedIds.users.admin,
        tokenId: "seed-admin-token",
        status: SessionStatus.active,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: seedIds.sessions.fixer,
        userId: seedIds.users.fixer,
        tokenId: "seed-fixer-token",
        status: SessionStatus.active,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.serviceType.createMany({
    data: SERVICE_CATALOG.map((service) => ({
      id: getServiceId(service.key),
      key: service.key,
      nameVi: service.nameVi,
      nameEn: service.nameEn,
      descriptionVi: service.descriptionVi,
      basePriceVnd: service.basePriceVnd,
      isFuelService: service.isFuelService,
    })),
  });

  await prisma.serviceAreaRule.createMany({
    data: [
      {
        id: seedIds.serviceAreas.hcmD1,
        cityProvince: "TP. Hồ Chí Minh",
        district: "Quận 1",
        responseWindowMinutes: 20,
        notes: "Vùng phủ nhanh nội đô trung tâm.",
      },
      {
        id: seedIds.serviceAreas.hcmD7,
        cityProvince: "TP. Hồ Chí Minh",
        district: "Quận 7",
        responseWindowMinutes: 25,
        notes: "Ưu tiên cứu hộ buổi tối và cuối tuần.",
      },
    ],
  });

  await prisma.pricingRule.createMany({
    data: SERVICE_CATALOG.map((service) => ({
      id: getPricingRuleId(service.key),
      serviceTypeId: getServiceId(service.key),
      cityProvince: "TP. Hồ Chí Minh",
      basePriceVnd: service.basePriceVnd,
      fuelPricePerLiterVnd: service.isFuelService ? 24000 : null,
      nightSurchargeVnd: 30000,
    })),
  });

  await prisma.fixerProfile.create({
    data: {
      id: seedIds.fixerProfile,
      userId: seedIds.users.fixer,
      displayName: "Khoa Rescue",
      phone: "0900000002",
      cityProvince: "TP. Hồ Chí Minh",
      districts: ["Quận 1", "Quận 4", "Quận 7", "Bình Thạnh"],
      vehicleTypeSupport: ["motorbike", "car", "truck", "van"],
      ratingAverage: 4.8,
      totalJobs: 126,
      isAvailable: true,
    },
  });

  await prisma.fixerServiceType.createMany({
    data: [
      "flat_tire",
      "battery_jump_start",
      "battery_replacement",
      "refill_gasoline",
      "refill_diesel",
      "roadside_help",
      "tow_request",
    ].map((serviceKey) => ({
      fixerProfileId: seedIds.fixerProfile,
      serviceTypeId: getServiceId(serviceKey),
    })),
  });

  await prisma.vehicle.createMany({
    data: [
      {
        id: seedIds.vehicles.car,
        userId: seedIds.users.customerOne,
        vehicleType: VehicleType.car,
        brand: "Toyota",
        model: "Vios",
        licensePlate: "51H-123.45",
        year: 2021,
        fuelType: FuelType.gasoline,
        notes: "Xe gia đình, ưu tiên cứu hộ tại nhà và văn phòng.",
        isDefault: true,
      },
      {
        id: seedIds.vehicles.bike,
        userId: seedIds.users.customerOne,
        vehicleType: VehicleType.motorbike,
        brand: "Honda",
        model: "SH 150i",
        licensePlate: "59X3-456.78",
        year: 2022,
        fuelType: FuelType.gasoline,
        notes: "Xe đi làm hằng ngày.",
      },
      {
        id: seedIds.vehicles.truck,
        userId: seedIds.users.customerTwo,
        vehicleType: VehicleType.truck,
        brand: "Hyundai",
        model: "Porter H150",
        licensePlate: "51C-998.88",
        year: 2020,
        fuelType: FuelType.diesel,
        notes: "Xe giao hàng nội thành.",
        isDefault: true,
      },
    ],
  });

  await prisma.carRegistrationDetails.create({
    data: {
      vehicleId: seedIds.vehicles.car,
      registrationNumber: "079321045",
      ownerName: "Trần Anh Duy",
      registrationProvinceCity: "TP. Hồ Chí Minh",
      inspectionExpiryDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      chassisNumber: "RL4BAX12345678901",
      engineNumber: "1NRF1234567",
    },
  });

  await prisma.savedAddress.createMany({
    data: [
      {
        id: seedIds.addresses.home,
        userId: seedIds.users.customerOne,
        label: "Nhà riêng",
        addressLine: "12 Nguyễn Hữu Cảnh",
        ward: "Phường 22",
        district: "Bình Thạnh",
        cityProvince: "TP. Hồ Chí Minh",
        landmark: "Gần Landmark 81",
        latitude: 10.7944,
        longitude: 106.7218,
        isDefault: true,
      },
      {
        id: seedIds.addresses.office,
        userId: seedIds.users.customerOne,
        label: "Văn phòng",
        addressLine: "99 Nguyễn Thị Thập",
        ward: "Tân Phú",
        district: "Quận 7",
        cityProvince: "TP. Hồ Chí Minh",
        landmark: "Khu Him Lam",
        latitude: 10.7388,
        longitude: 106.7067,
      },
      {
        id: seedIds.addresses.warehouse,
        userId: seedIds.users.customerTwo,
        label: "Kho hàng",
        addressLine: "45 Quốc lộ 13",
        ward: "Hiệp Bình Phước",
        district: "Thủ Đức",
        cityProvince: "TP. Hồ Chí Minh",
        landmark: "Cạnh ngã tư Bình Phước",
        latitude: 10.8458,
        longitude: 106.7424,
        isDefault: true,
      },
    ],
  });

  await prisma.request.createMany({
    data: [
      {
        id: seedIds.requests.activeBattery,
        requestCode: "RSQ-250401-301",
        userId: seedIds.users.customerOne,
        vehicleId: seedIds.vehicles.car,
        savedAddressId: seedIds.addresses.office,
        serviceTypeId: getServiceId("battery_jump_start"),
        assignedFixerId: seedIds.users.fixer,
        status: RequestStatus.fixer_on_the_way,
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
      },
      {
        id: seedIds.requests.completedFlatTire,
        requestCode: "RSQ-250330-184",
        userId: seedIds.users.customerTwo,
        vehicleId: seedIds.vehicles.truck,
        savedAddressId: seedIds.addresses.warehouse,
        serviceTypeId: getServiceId("flat_tire"),
        assignedFixerId: seedIds.users.fixer,
        status: RequestStatus.completed,
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
      },
      {
        id: seedIds.requests.dieselRefill,
        requestCode: "RSQ-250401-412",
        userId: seedIds.users.customerTwo,
        vehicleId: seedIds.vehicles.truck,
        savedAddressId: seedIds.addresses.warehouse,
        serviceTypeId: getServiceId("refill_diesel"),
        status: RequestStatus.processing,
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
      },
    ],
  });

  await prisma.requestFuelDetails.create({
    data: {
      requestId: seedIds.requests.dieselRefill,
      fuelType: FuelType.diesel,
      litersRequested: 8,
      preferredGrade: "DO 0.05S",
    },
  });

  await prisma.requestPhoto.create({
    data: {
      requestId: seedIds.requests.completedFlatTire,
      fileName: "lop-sau-bi-dinh.jpg",
      caption: "Lốp sau bị cán đinh trước khi vá.",
    },
  });

  await prisma.requestStatusLog.createMany({
    data: [
      {
        requestId: seedIds.requests.activeBattery,
        status: RequestStatus.submitted,
        titleVi: "Yêu cầu đã được gửi",
        descriptionVi: "ResQ đã nhận yêu cầu kích bình của bạn.",
        actorUserId: seedIds.users.customerOne,
        createdAt: ninetyMinutesAgo,
      },
      {
        requestId: seedIds.requests.activeBattery,
        status: RequestStatus.processing,
        titleVi: "Đang xử lý",
        descriptionVi: "Hệ thống đang tìm fixer gần vị trí hiện tại.",
        actorUserId: seedIds.users.admin,
        createdAt: new Date(ninetyMinutesAgo.getTime() + 10 * 60 * 1000),
      },
      {
        requestId: seedIds.requests.activeBattery,
        status: RequestStatus.fixer_matched,
        titleVi: "Đã ghép kỹ thuật viên",
        descriptionVi: "Khoa Rescue nhận xử lý yêu cầu này.",
        actorUserId: seedIds.users.admin,
        createdAt: new Date(ninetyMinutesAgo.getTime() + 18 * 60 * 1000),
      },
      {
        requestId: seedIds.requests.activeBattery,
        status: RequestStatus.fixer_on_the_way,
        titleVi: "Kỹ thuật viên đang đến",
        descriptionVi: "Ước tính đến nơi sau 12 phút.",
        actorUserId: seedIds.users.fixer,
        etaMinutes: 12,
        createdAt: new Date(ninetyMinutesAgo.getTime() + 24 * 60 * 1000),
      },
      {
        requestId: seedIds.requests.completedFlatTire,
        status: RequestStatus.submitted,
        titleVi: "Yêu cầu vá lốp đã được gửi",
        actorUserId: seedIds.users.customerTwo,
        createdAt: twoDaysAgo,
      },
      {
        requestId: seedIds.requests.completedFlatTire,
        status: RequestStatus.fixer_matched,
        titleVi: "Đã ghép kỹ thuật viên",
        actorUserId: seedIds.users.admin,
        createdAt: twoDaysAgoPlus20,
      },
      {
        requestId: seedIds.requests.completedFlatTire,
        status: RequestStatus.in_progress,
        titleVi: "Fixer đang xử lý",
        descriptionVi: "Đang vá lốp và kiểm tra áp suất bánh còn lại.",
        actorUserId: seedIds.users.fixer,
        createdAt: twoDaysAgoPlus45,
      },
      {
        requestId: seedIds.requests.completedFlatTire,
        status: RequestStatus.completed,
        titleVi: "Hoàn thành",
        descriptionVi: "Khách đã xác nhận lốp hoạt động ổn định.",
        actorUserId: seedIds.users.fixer,
        createdAt: twoDaysAgoPlus70,
      },
      {
        requestId: seedIds.requests.dieselRefill,
        status: RequestStatus.submitted,
        titleVi: "Yêu cầu tiếp dầu đã được gửi",
        actorUserId: seedIds.users.customerTwo,
        createdAt: oneHourAgo,
      },
      {
        requestId: seedIds.requests.dieselRefill,
        status: RequestStatus.processing,
        titleVi: "Đang điều phối",
        descriptionVi: "Ưu tiên fixer có thể tiếp diesel tại Thủ Đức.",
        actorUserId: seedIds.users.admin,
        etaMinutes: 20,
        createdAt: new Date(oneHourAgo.getTime() + 8 * 60 * 1000),
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        id: seedIds.invoices.activeBattery,
        requestId: seedIds.requests.activeBattery,
        serviceFeeVnd: 180000,
        fuelCostVnd: 0,
        extraChargesVnd: 0,
        totalVnd: 180000,
        paymentStatus: PaymentStatus.pending,
        issuedAt: now,
      },
      {
        id: seedIds.invoices.completedFlatTire,
        requestId: seedIds.requests.completedFlatTire,
        serviceFeeVnd: 140000,
        fuelCostVnd: 0,
        extraChargesVnd: 0,
        totalVnd: 140000,
        paymentStatus: PaymentStatus.paid,
        issuedAt: twoDaysAgoPlus70,
        paidAt: twoDaysAgoPlus70,
      },
      {
        id: seedIds.invoices.dieselRefill,
        requestId: seedIds.requests.dieselRefill,
        serviceFeeVnd: 100000,
        fuelCostVnd: 192000,
        extraChargesVnd: 0,
        totalVnd: 292000,
        paymentStatus: PaymentStatus.pending,
        issuedAt: now,
      },
    ],
  });

  await prisma.payment.createMany({
    data: [
      {
        requestId: seedIds.requests.activeBattery,
        invoiceId: seedIds.invoices.activeBattery,
        amountVnd: 180000,
        method: PaymentMethod.cash,
        status: PaymentStatus.pending,
        providerName: "ResQ Cash",
      },
      {
        requestId: seedIds.requests.completedFlatTire,
        invoiceId: seedIds.invoices.completedFlatTire,
        amountVnd: 140000,
        method: PaymentMethod.ewallet,
        status: PaymentStatus.paid,
        referenceCode: "EWALLET-RSQ-330184",
        providerName: "Ví DemoPay",
      },
      {
        requestId: seedIds.requests.dieselRefill,
        invoiceId: seedIds.invoices.dieselRefill,
        amountVnd: 292000,
        method: PaymentMethod.bank_transfer,
        status: PaymentStatus.pending,
        providerName: "Bank Transfer Placeholder",
      },
    ],
  });

  await prisma.review.create({
    data: {
      id: seedIds.reviews.completedFlatTire,
      requestId: seedIds.requests.completedFlatTire,
      userId: seedIds.users.customerTwo,
      overallRating: 5,
      professionalismRating: 5,
      arrivalSpeedRating: 4,
      serviceQualityRating: 5,
      communicationRating: 5,
      comment: "Fixer đến đúng hẹn, làm việc gọn gàng và giải thích rất rõ.",
      createdAt: twoDaysAgoPlus70,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: seedIds.users.customerOne,
        requestId: seedIds.requests.activeBattery,
        type: "request_update",
        channel: "app",
        titleVi: "Fixer đang đến",
        messageVi: "Khoa Rescue sẽ đến vị trí của bạn trong khoảng 12 phút.",
      },
      {
        userId: seedIds.users.customerTwo,
        requestId: seedIds.requests.completedFlatTire,
        type: "payment",
        channel: "app",
        titleVi: "Thanh toán hoàn tất",
        messageVi: "Hóa đơn vá lốp RSQ-250330-184 đã được thanh toán thành công.",
      },
    ],
  });
}
