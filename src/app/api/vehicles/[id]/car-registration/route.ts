import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { updateCarRegistrationForVehicle } from "@/server/services/vehicle-service";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateCarRegistrationForVehicle(user.id, id, body);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
