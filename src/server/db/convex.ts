import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id, TableNames } from "../../../convex/_generated/dataModel";

import { convexConfig } from "@/lib/convex";

declare global {
  var resqConvex: ConvexHttpClient | undefined;
}

const dateKeys = new Set([
  "createdAt",
  "updatedAt",
  "expiresAt",
  "lastSeenAt",
  "inspectionExpiryDate",
  "scheduledAt",
  "cancelledAt",
  "completedAt",
  "issuedAt",
  "paidAt",
]);

function getConvexClient() {
  if (!convexConfig.cloudUrl) {
    throw new Error("Thiếu NEXT_PUBLIC_CONVEX_URL để kết nối Convex.");
  }

  if (!globalThis.resqConvex) {
    globalThis.resqConvex = new ConvexHttpClient(convexConfig.cloudUrl);
  }

  return globalThis.resqConvex;
}

function reviveDates(value: unknown, key?: string): unknown {
  if (value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => {
        if (dateKeys.has(entryKey) && typeof entryValue === "number") {
          return [entryKey, new Date(entryValue)];
        }

        return [entryKey, reviveDates(entryValue, entryKey)];
      }),
    );
  }

  if (dateKeys.has(key ?? "") && typeof value === "number") {
    return new Date(value);
  }

  return value;
}

export function asConvexId<TableName extends TableNames>(value: string) {
  return value as Id<TableName>;
}

export async function convexQuery<TResult = any>(fn: any, args: object) {
  const result = await getConvexClient().query(fn, args);
  return reviveDates(result) as TResult;
}

export async function convexMutation<TResult = any>(fn: any, args: object) {
  const result = await getConvexClient().mutation(fn, args);
  return reviveDates(result) as TResult;
}

export { api };
