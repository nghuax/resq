import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { createRequestForUser } from "@/server/services/request-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const created = await createRequestForUser(user.id, body);
    return ok(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
