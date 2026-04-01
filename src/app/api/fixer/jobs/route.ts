import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import { getFixerProfileForUser, listFixerJobs } from "@/server/services/fixer-service";

export async function GET() {
  try {
    const fixer = await requireRole(["fixer"]);
    const [jobs, profile] = await Promise.all([
      listFixerJobs(fixer.id),
      getFixerProfileForUser(fixer.id),
    ]);
    return ok({ jobs, profile });
  } catch (error) {
    return handleApiError(error);
  }
}
