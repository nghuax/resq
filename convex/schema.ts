// @ts-nocheck
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  fuelTypeValidator,
  notificationChannelValidator,
  notificationTypeValidator,
  paymentMethodValidator,
  paymentStatusValidator,
  requestStatusValidator,
  sessionStatusValidator,
  userRoleValidator,
  vehicleTypeValidator,
} from "./lib/validators";

export default defineSchema({
  users: defineTable({
    phone: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    role: userRoleValidator,
    locale: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_phone", ["phone"])
    .index("by_role", ["role"]),

  userSessions: defineTable({
    userId: v.id("users"),
    tokenId: v.string(),
    status: sessionStatusValidator,
    expiresAt: v.number(),
    lastSeenAt: v.optional(v.number()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_tokenId", ["tokenId"])
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  vehicles: defineTable({
    userId: v.id("users"),
    vehicleType: vehicleTypeValidator,
    brand: v.string(),
    model: v.string(),
    licensePlate: v.string(),
    year: v.optional(v.number()),
    fuelType: fuelTypeValidator,
    notes: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isDefault", ["userId", "isDefault"]),

  carRegistrationDetails: defineTable({
    vehicleId: v.id("vehicles"),
    registrationNumber: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    registrationProvinceCity: v.optional(v.string()),
    inspectionExpiryDate: v.optional(v.number()),
    chassisNumber: v.optional(v.string()),
    engineNumber: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_vehicleId", ["vehicleId"]),

  savedAddresses: defineTable({
    userId: v.id("users"),
    label: v.string(),
    addressLine: v.string(),
    ward: v.string(),
    district: v.string(),
    cityProvince: v.string(),
    landmark: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    isDefault: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isDefault", ["userId", "isDefault"]),

  serviceTypes: defineTable({
    key: v.string(),
    nameVi: v.string(),
    nameEn: v.string(),
    descriptionVi: v.optional(v.string()),
    isFuelService: v.boolean(),
    basePriceVnd: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_isActive", ["isActive"]),

  fixerProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    phone: v.string(),
    cityProvince: v.string(),
    districts: v.array(v.string()),
    vehicleTypeSupport: v.array(v.string()),
    ratingAverage: v.number(),
    totalJobs: v.number(),
    isAvailable: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  fixerServiceTypes: defineTable({
    fixerProfileId: v.id("fixerProfiles"),
    serviceTypeId: v.id("serviceTypes"),
    createdAt: v.number(),
  })
    .index("by_fixerProfileId", ["fixerProfileId"])
    .index("by_serviceTypeId", ["serviceTypeId"])
    .index("by_fixerProfileId_serviceTypeId", ["fixerProfileId", "serviceTypeId"]),

  requests: defineTable({
    requestCode: v.string(),
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    savedAddressId: v.optional(v.id("savedAddresses")),
    serviceTypeId: v.id("serviceTypes"),
    assignedFixerId: v.optional(v.id("users")),
    status: requestStatusValidator,
    note: v.optional(v.string()),
    contactPhone: v.string(),
    scheduledAt: v.optional(v.number()),
    locationLabel: v.string(),
    addressLine: v.string(),
    ward: v.string(),
    district: v.string(),
    cityProvince: v.string(),
    landmark: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    priceEstimateVnd: v.number(),
    finalPriceVnd: v.optional(v.number()),
    cancelReason: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestCode", ["requestCode"])
    .index("by_userId", ["userId"])
    .index("by_assignedFixerId", ["assignedFixerId"])
    .index("by_status", ["status"]),

  requestFuelDetails: defineTable({
    requestId: v.id("requests"),
    fuelType: fuelTypeValidator,
    litersRequested: v.number(),
    preferredGrade: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_requestId", ["requestId"]),

  requestPhotos: defineTable({
    requestId: v.id("requests"),
    fileName: v.string(),
    imageUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_requestId", ["requestId"]),

  requestStatusLogs: defineTable({
    requestId: v.id("requests"),
    status: requestStatusValidator,
    titleVi: v.string(),
    descriptionVi: v.optional(v.string()),
    actorUserId: v.optional(v.id("users")),
    etaMinutes: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_requestId", ["requestId"]),

  invoices: defineTable({
    requestId: v.id("requests"),
    serviceFeeVnd: v.number(),
    fuelCostVnd: v.number(),
    extraChargesVnd: v.number(),
    totalVnd: v.number(),
    paymentStatus: paymentStatusValidator,
    issuedAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_requestId", ["requestId"]),

  payments: defineTable({
    requestId: v.id("requests"),
    invoiceId: v.optional(v.id("invoices")),
    amountVnd: v.number(),
    method: paymentMethodValidator,
    status: paymentStatusValidator,
    referenceCode: v.optional(v.string()),
    providerName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_invoiceId", ["invoiceId"]),

  reviews: defineTable({
    requestId: v.id("requests"),
    userId: v.id("users"),
    overallRating: v.number(),
    professionalismRating: v.number(),
    arrivalSpeedRating: v.number(),
    serviceQualityRating: v.number(),
    communicationRating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_userId", ["userId"]),

  serviceAreaRules: defineTable({
    cityProvince: v.string(),
    district: v.optional(v.string()),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    responseWindowMinutes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_cityProvince", ["cityProvince"])
    .index("by_cityProvince_district", ["cityProvince", "district"]),

  pricingRules: defineTable({
    serviceTypeId: v.id("serviceTypes"),
    cityProvince: v.optional(v.string()),
    vehicleType: v.optional(vehicleTypeValidator),
    basePriceVnd: v.number(),
    fuelPricePerLiterVnd: v.optional(v.number()),
    nightSurchargeVnd: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_serviceTypeId", ["serviceTypeId"])
    .index("by_serviceTypeId_cityProvince", ["serviceTypeId", "cityProvince"]),

  notifications: defineTable({
    userId: v.id("users"),
    requestId: v.optional(v.id("requests")),
    type: notificationTypeValidator,
    channel: notificationChannelValidator,
    titleVi: v.string(),
    messageVi: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_requestId", ["requestId"]),
});
