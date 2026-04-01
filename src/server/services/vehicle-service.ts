import { ApiError } from "@/lib/api-response";
import { coerceOptionalString } from "@/lib/utils";
import { updateCarRegistrationSchema, vehicleFormSchema } from "@/schemas/vehicle";
import { getDb } from "@/server/db/prisma";

export async function listVehiclesForUser(userId: string) {
  const db = await getDb();

  return db.vehicle.findMany({
    where: {
      userId,
    },
    include: {
      carRegistration: true,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function createVehicleForUser(userId: string, rawInput: unknown) {
  const input = vehicleFormSchema.parse(rawInput);
  const db = await getDb();

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.vehicle.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const vehicle = await tx.vehicle.create({
      data: {
        userId,
        vehicleType: input.vehicleType,
        brand: input.brand,
        model: input.model,
        licensePlate: input.licensePlate,
        year: input.year,
        fuelType: input.fuelType,
        notes: coerceOptionalString(input.notes),
        isDefault: input.isDefault,
        carRegistration:
          input.vehicleType === "car" && input.carRegistration
            ? {
                create: {
                  registrationNumber: coerceOptionalString(
                    input.carRegistration.registrationNumber,
                  ),
                  ownerName: coerceOptionalString(input.carRegistration.ownerName),
                  registrationProvinceCity: coerceOptionalString(
                    input.carRegistration.registrationProvinceCity,
                  ),
                  inspectionExpiryDate: input.carRegistration.inspectionExpiryDate
                    ? new Date(input.carRegistration.inspectionExpiryDate)
                    : undefined,
                  chassisNumber: coerceOptionalString(
                    input.carRegistration.chassisNumber,
                  ),
                  engineNumber: coerceOptionalString(
                    input.carRegistration.engineNumber,
                  ),
                },
              }
            : undefined,
      },
      include: {
        carRegistration: true,
      },
    });

    return vehicle;
  });
}

export async function updateCarRegistrationForVehicle(
  userId: string,
  vehicleId: string,
  rawInput: unknown,
) {
  const input = updateCarRegistrationSchema.parse(rawInput);
  const db = await getDb();

  const vehicle = await db.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId,
    },
    select: {
      id: true,
      vehicleType: true,
    },
  });

  if (!vehicle) {
    throw new ApiError("Không tìm thấy phương tiện.", 404);
  }

  if (vehicle.vehicleType !== "car") {
    throw new ApiError("Chỉ ô tô mới có thông tin đăng ký.", 400);
  }

  return db.carRegistrationDetails.upsert({
    where: {
      vehicleId,
    },
    update: {
      registrationNumber: coerceOptionalString(input.registrationNumber),
      ownerName: coerceOptionalString(input.ownerName),
      registrationProvinceCity: coerceOptionalString(
        input.registrationProvinceCity,
      ),
      inspectionExpiryDate: input.inspectionExpiryDate
        ? new Date(input.inspectionExpiryDate)
        : null,
      chassisNumber: coerceOptionalString(input.chassisNumber),
      engineNumber: coerceOptionalString(input.engineNumber),
    },
    create: {
      vehicleId,
      registrationNumber: coerceOptionalString(input.registrationNumber),
      ownerName: coerceOptionalString(input.ownerName),
      registrationProvinceCity: coerceOptionalString(
        input.registrationProvinceCity,
      ),
      inspectionExpiryDate: input.inspectionExpiryDate
        ? new Date(input.inspectionExpiryDate)
        : undefined,
      chassisNumber: coerceOptionalString(input.chassisNumber),
      engineNumber: coerceOptionalString(input.engineNumber),
    },
  });
}
