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
import { getDb } from "@/server/db/prisma";

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

  const db = await getDb();

  let user = await db.user.findUnique({
    where: {
      phone: normalizedPhone,
    },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        phone: normalizedPhone,
        name:
          input.name?.trim() ||
          `Khách hàng ${normalizedPhone.slice(Math.max(0, normalizedPhone.length - 4))}`,
        role: "customer",
      },
    });
  }

  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db.userSession.create({
    data: {
      userId: user.id,
      tokenId,
      expiresAt,
      userAgent: metadata?.userAgent ?? undefined,
      ipAddress: metadata?.ipAddress ?? undefined,
    },
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
    const db = await getDb();

    const session = await db.userSession.findUnique({
      where: {
        tokenId: payload.sessionId,
      },
      include: {
        user: true,
      },
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
      const db = await getDb();

      await db.userSession.updateMany({
        where: {
          tokenId: payload.sessionId,
        },
        data: {
          status: "revoked",
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  await clearSessionCookie();
}
