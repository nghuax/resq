import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import { updateFixerJobStatus } from "@/server/services/fixer-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const fixer = await requireRole(["fixer"]);
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateFixerJobStatus(fixer.id, id, body);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
