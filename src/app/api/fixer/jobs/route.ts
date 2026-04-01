import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/server/services/auth-service";
import { getDb } from "@/server/db/prisma";
import { listFixerJobs } from "@/server/services/fixer-service";

export async function GET() {
  try {
    const fixer = await requireRole(["fixer"]);
    const db = await getDb();
    const [jobs, profile] = await Promise.all([
      listFixerJobs(fixer.id),
      db.fixerProfile.findUnique({
        where: {
          userId: fixer.id,
        },
      }),
    ]);
    return ok({ jobs, profile });
  } catch (error) {
    return handleApiError(error);
  }
}
