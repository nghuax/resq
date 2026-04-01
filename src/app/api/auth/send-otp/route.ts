import { handleApiError, ok } from "@/lib/api-response";
import { sendOtp } from "@/server/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await sendOtp(body);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
