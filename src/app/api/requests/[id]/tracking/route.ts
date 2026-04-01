import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { getTrackingForUser } from "@/server/services/request-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const tracking = await getTrackingForUser(user.id, id);
    return ok(tracking);
  } catch (error) {
    return handleApiError(error);
  }
}
