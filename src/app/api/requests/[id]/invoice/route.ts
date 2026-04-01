import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import { getInvoiceForUser } from "@/server/services/request-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const invoice = await getInvoiceForUser(user.id, id);
    return ok(invoice);
  } catch (error) {
    return handleApiError(error);
  }
}
