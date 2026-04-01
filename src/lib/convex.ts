import { env } from "@/lib/env";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const convexConfig = {
  cloudUrl: stripTrailingSlash(env.NEXT_PUBLIC_CONVEX_URL),
  httpActionsUrl: stripTrailingSlash(env.CONVEX_HTTP_ACTIONS_URL),
} as const;

export const hasConvexConfig =
  Boolean(convexConfig.cloudUrl) && Boolean(convexConfig.httpActionsUrl);
