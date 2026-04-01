import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { payForRequest } from "@/server/services/request-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const result = await payForRequest(user.id, id, body);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
