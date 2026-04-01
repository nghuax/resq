import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";

const SESSION_COOKIE = "resq_session";
const encoder = new TextEncoder();

export type SessionPayload = {
  sessionId: string;
  userId: string;
  role: string;
};

function getSecret() {
  return encoder.encode(env.JWT_SECRET);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify<SessionPayload>(token, getSecret());
  return result.payload;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}
