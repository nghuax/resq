import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { getPaymentSummaryForUser } from "@/server/services/request-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const summary = await getPaymentSummaryForUser(user.id, id);
    return ok(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
