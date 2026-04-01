import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { createReviewForUser } from "@/server/services/request-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();
    const review = await createReviewForUser(user.id, id, body);
    return ok(review, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
