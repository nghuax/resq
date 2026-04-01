import type { UserRole } from "@prisma/client";

import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/lib/navigation";
import { getCurrentUser } from "@/server/services/auth-service";

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  return user;
}

export async function requirePageRole(roles: UserRole[]) {
  const user = await requirePageUser();

  if (!roles.includes(user.role)) {
    redirect(getRoleHomePath(user.role));
  }

  return user;
}
