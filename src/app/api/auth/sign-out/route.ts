import { handleApiError, ok } from "@/lib/api-response";
import { signOutCurrentUser } from "@/server/services/auth-service";

export async function POST() {
  try {
    await signOutCurrentUser();
    return ok({ signedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}
