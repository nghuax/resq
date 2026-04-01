function readNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/resq",
  JWT_SECRET: process.env.JWT_SECRET ?? "resq-local-dev-secret-change-me",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_CONVEX_URL:
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    "https://bright-bear-144.convex.cloud",
  CONVEX_HTTP_ACTIONS_URL:
    process.env.CONVEX_HTTP_ACTIONS_URL ??
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    "https://bright-bear-144.convex.site",
  OTP_DEV_FALLBACK_CODE: process.env.OTP_DEV_FALLBACK_CODE ?? "123456",
  NEXT_PUBLIC_DEFAULT_LAT: readNumber(
    process.env.NEXT_PUBLIC_DEFAULT_LAT,
    10.7769,
  ),
  NEXT_PUBLIC_DEFAULT_LNG: readNumber(
    process.env.NEXT_PUBLIC_DEFAULT_LNG,
    106.7009,
  ),
};
