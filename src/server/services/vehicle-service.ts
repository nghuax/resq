import { ApiError } from "@/lib/api-response";
import { coerceOptionalString } from "@/lib/utils";
import { updateCarRegistrationSchema, vehicleFormSchema } from "@/schemas/vehicle";
import { api, asConvexId, convexMutation, convexQuery } from "@/server/db/convex";
import type { CarRegistrationView, VehicleView } from "@/server/services/view-models";

export async function listVehiclesForUser(userId: string): Promise<VehicleView[]> {
  return convexQuery<VehicleView[]>(api.customer.listVehiclesForUser, {
    userId: asConvexId<"users">(userId),
  });
}

export async function createVehicleForUser(
  userId: string,
  rawInput: unknown,
): Promise<VehicleView> {
  const input = vehicleFormSchema.parse(rawInput);
  return convexMutation<VehicleView>(api.customer.createVehicleForUser, {
    userId: asConvexId<"users">(userId),
    input: {
      ...input,
      notes: coerceOptionalString(input.notes),
      carRegistration:
        input.vehicleType === "car" && input.carRegistration
          ? {
              registrationNumber: coerceOptionalString(
                input.carRegistration.registrationNumber,
              ),
              ownerName: coerceOptionalString(input.carRegistration.ownerName),
              registrationProvinceCity: coerceOptionalString(
                input.carRegistration.registrationProvinceCity,
              ),
              inspectionExpiryDate: input.carRegistration.inspectionExpiryDate || undefined,
              chassisNumber: coerceOptionalString(input.carRegistration.chassisNumber),
              engineNumber: coerceOptionalString(input.carRegistration.engineNumber),
            }
          : undefined,
    },
  });
}

export async function updateCarRegistrationForVehicle(
  userId: string,
  vehicleId: string,
  rawInput: unknown,
): Promise<CarRegistrationView> {
  const input = updateCarRegistrationSchema.parse(rawInput);
  try {
    return await convexMutation<CarRegistrationView>(
      api.customer.updateCarRegistrationForVehicle,
      {
        userId: asConvexId<"users">(userId),
        vehicleId: asConvexId<"vehicles">(vehicleId),
        input: {
        registrationNumber: coerceOptionalString(input.registrationNumber),
        ownerName: coerceOptionalString(input.ownerName),
        registrationProvinceCity: coerceOptionalString(input.registrationProvinceCity),
        inspectionExpiryDate: input.inspectionExpiryDate || undefined,
        chassisNumber: coerceOptionalString(input.chassisNumber),
        engineNumber: coerceOptionalString(input.engineNumber),
        },
      },
    );
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError(
      error instanceof Error ? error.message : "Không thể cập nhật đăng ký xe.",
      400,
    );
  }
}
