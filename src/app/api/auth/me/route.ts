import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/server/services/auth-service";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user });
}
