import { handleApiError, ok } from "@/lib/api-response";
import { listServiceTypes } from "@/server/services/service-type-service";

export async function GET() {
  try {
    const services = await listServiceTypes();
    return ok(services);
  } catch (error) {
    return handleApiError(error);
  }
}
