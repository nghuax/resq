import type { UserRole } from "@prisma/client";

import { ApiError } from "@/lib/api-response";
import { createOtpChallenge, verifyOtpChallenge } from "@/lib/auth/otp-store";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
  signSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";
import { normalizeVietnamesePhone } from "@/lib/utils";
import { sendOtpSchema, verifyOtpSchema } from "@/schemas/auth";
import { api, convexMutation, convexQuery } from "@/server/db/convex";

export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
};

function toSessionUser(user: {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}): SessionUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
}

export async function sendOtp(rawInput: unknown) {
  const input = sendOtpSchema.parse(rawInput);
  const normalizedPhone = normalizeVietnamesePhone(input.phone);
  const challenge = createOtpChallenge(normalizedPhone);

  return {
    phone: normalizedPhone,
    expiresAt: challenge.expiresAt,
    devOtpCode:
      process.env.NODE_ENV === "production" ? undefined : challenge.code,
  };
}

export async function verifyOtp(
  rawInput: unknown,
  metadata?: {
    userAgent?: string | null;
    ipAddress?: string | null;
  },
) {
  const input = verifyOtpSchema.parse(rawInput);
  const normalizedPhone = normalizeVietnamesePhone(input.phone);
  const verified = verifyOtpChallenge(normalizedPhone, input.otp);

  if (!verified.ok) {
    throw new ApiError(verified.reason ?? "Xác thực OTP thất bại.", 401);
  }

  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const user = await convexMutation<SessionUser>(api.auth.upsertUserAndCreateSession, {
    phone: normalizedPhone,
    name: input.name?.trim() || undefined,
    tokenId,
    expiresAt: expiresAt.getTime(),
    userAgent: metadata?.userAgent ?? undefined,
    ipAddress: metadata?.ipAddress ?? undefined,
  });

  const token = await signSessionToken({
    sessionId: tokenId,
    userId: user.id,
    role: user.role,
  });

  await setSessionCookie(token);

  return {
    user: toSessionUser(user),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function getCurrentUser() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const session = await convexQuery<{
      status: string;
      expiresAt: Date;
      user: SessionUser & { isActive: boolean };
    } | null>(api.auth.getSessionWithUserByTokenId, {
      tokenId: payload.sessionId,
    });

    if (
      !session ||
      session.status !== "active" ||
      session.expiresAt.getTime() < Date.now() ||
      !session.user.isActive
    ) {
      await clearSessionCookie();
      return null;
    }

    return toSessionUser(session.user);
  } catch (error) {
    console.error(error);
    await clearSessionCookie();
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Bạn cần đăng nhập để tiếp tục.", 401);
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new ApiError("Bạn không có quyền truy cập chức năng này.", 403);
  }

  return user;
}

export async function signOutCurrentUser() {
  const token = await getSessionCookie();

  if (token) {
    try {
      const payload = await verifySessionToken(token);
      await convexMutation(api.auth.revokeSessionByTokenId, {
        tokenId: payload.sessionId,
      });
    } catch (error) {
      console.error(error);
    }
  }

  await clearSessionCookie();
}
