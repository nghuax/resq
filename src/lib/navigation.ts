import type { UserRole } from "@prisma/client";

export function getRoleHomePath(role: UserRole) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "fixer") {
    return "/fixer";
  }

  return "/dashboard";
}
