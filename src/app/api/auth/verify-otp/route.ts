import { handleApiError, ok } from "@/lib/api-response";
import { verifyOtp } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await verifyOtp(body, {
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("x-forwarded-for"),
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
