import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { getRequestForUser } from "@/server/services/request-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const data = await getRequestForUser(user.id, id);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
