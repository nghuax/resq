import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/server/services/auth-service";
import {
  createAddressForUser,
  listAddressesForUser,
} from "@/server/services/address-service";

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await listAddressesForUser(user.id);
    return ok(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const address = await createAddressForUser(user.id, body);
    return ok(address, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
