import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import {
  createVehicleForUser,
  listVehiclesForUser,
} from "@/server/services/vehicle-service";

export async function GET() {
  try {
    const user = await requireUser();
    const vehicles = await listVehiclesForUser(user.id);
    return ok(vehicles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const vehicle = await createVehicleForUser(user.id, body);
    return ok(vehicle, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
