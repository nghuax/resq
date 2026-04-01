-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'fixer', 'admin');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('motorbike', 'car', 'truck', 'van');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid', 'unknown');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('submitted', 'processing', 'fixer_matched', 'fixer_on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'ewallet', 'card', 'bank_transfer');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('request_update', 'system', 'payment', 'otp');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('app', 'sms', 'email');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "locale" TEXT NOT NULL DEFAULT 'vi',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "year" INTEGER,
    "fuelType" "FuelType" NOT NULL DEFAULT 'unknown',
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarRegistrationDetails" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "ownerName" TEXT,
    "registrationProvinceCity" TEXT,
    "inspectionExpiryDate" TIMESTAMP(3),
    "chassisNumber" TEXT,
    "engineNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarRegistrationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "cityProvince" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionVi" TEXT,
    "isFuelService" BOOLEAN NOT NULL DEFAULT false,
    "basePriceVnd" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cityProvince" TEXT NOT NULL,
    "districts" TEXT[],
    "vehicleTypeSupport" TEXT[],
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixerServiceType" (
    "id" TEXT NOT NULL,
    "fixerProfileId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixerServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "savedAddressId" TEXT,
    "serviceTypeId" TEXT NOT NULL,
    "assignedFixerId" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'submitted',
    "note" TEXT,
    "contactPhone" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "locationLabel" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "cityProvince" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "priceEstimateVnd" INTEGER NOT NULL DEFAULT 0,
    "finalPriceVnd" INTEGER,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestFuelDetails" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "litersRequested" DOUBLE PRECISION NOT NULL,
    "preferredGrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestFuelDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestPhoto" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestStatusLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "titleVi" TEXT NOT NULL,
    "descriptionVi" TEXT,
    "actorUserId" TEXT,
    "etaMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "serviceFeeVnd" INTEGER NOT NULL DEFAULT 0,
    "fuelCostVnd" INTEGER NOT NULL DEFAULT 0,
    "extraChargesVnd" INTEGER NOT NULL DEFAULT 0,
    "totalVnd" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amountVnd" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "referenceCode" TEXT,
    "providerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "professionalismRating" INTEGER NOT NULL,
    "arrivalSpeedRating" INTEGER NOT NULL,
    "serviceQualityRating" INTEGER NOT NULL,
    "communicationRating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAreaRule" (
    "id" TEXT NOT NULL,
    "cityProvince" TEXT NOT NULL,
    "district" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "responseWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAreaRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "cityProvince" TEXT,
    "vehicleType" "VehicleType",
    "basePriceVnd" INTEGER NOT NULL,
    "fuelPricePerLiterVnd" INTEGER,
    "nightSurchargeVnd" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "titleVi" TEXT NOT NULL,
    "messageVi" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenId_key" ON "UserSession"("tokenId");

-- CreateIndex
CREATE INDEX "UserSession_userId_status_idx" ON "UserSession"("userId", "status");

-- CreateIndex
CREATE INDEX "Vehicle_userId_isDefault_idx" ON "Vehicle"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "CarRegistrationDetails_vehicleId_key" ON "CarRegistrationDetails"("vehicleId");

-- CreateIndex
CREATE INDEX "SavedAddress_userId_isDefault_idx" ON "SavedAddress"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_key_key" ON "ServiceType"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FixerProfile_userId_key" ON "FixerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FixerServiceType_fixerProfileId_serviceTypeId_key" ON "FixerServiceType"("fixerProfileId", "serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestCode_key" ON "Request"("requestCode");

-- CreateIndex
CREATE INDEX "Request_userId_status_idx" ON "Request"("userId", "status");

-- CreateIndex
CREATE INDEX "Request_assignedFixerId_status_idx" ON "Request"("assignedFixerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RequestFuelDetails_requestId_key" ON "RequestFuelDetails"("requestId");

-- CreateIndex
CREATE INDEX "RequestPhoto_requestId_idx" ON "RequestPhoto"("requestId");

-- CreateIndex
CREATE INDEX "RequestStatusLog_requestId_createdAt_idx" ON "RequestStatusLog"("requestId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_requestId_key" ON "Invoice"("requestId");

-- CreateIndex
CREATE INDEX "Payment_requestId_status_idx" ON "Payment"("requestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_requestId_key" ON "Review"("requestId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarRegistrationDetails" ADD CONSTRAINT "CarRegistrationDetails_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixerProfile" ADD CONSTRAINT "FixerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixerServiceType" ADD CONSTRAINT "FixerServiceType_fixerProfileId_fkey" FOREIGN KEY ("fixerProfileId") REFERENCES "FixerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixerServiceType" ADD CONSTRAINT "FixerServiceType_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_savedAddressId_fkey" FOREIGN KEY ("savedAddressId") REFERENCES "SavedAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_assignedFixerId_fkey" FOREIGN KEY ("assignedFixerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFuelDetails" ADD CONSTRAINT "RequestFuelDetails_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestPhoto" ADD CONSTRAINT "RequestPhoto_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestStatusLog" ADD CONSTRAINT "RequestStatusLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestStatusLog" ADD CONSTRAINT "RequestStatusLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

