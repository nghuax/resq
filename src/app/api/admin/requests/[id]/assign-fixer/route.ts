import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import { assignFixerToRequest } from "@/server/services/admin-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await context.params;
    const body = await request.json();
    const result = await assignFixerToRequest(id, body, admin.id);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
