import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { cancelRequestForUser } from "@/server/services/request-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const cancelled = await cancelRequestForUser(user.id, id, body);
    return ok(cancelled);
  } catch (error) {
    return handleApiError(error);
  }
}
