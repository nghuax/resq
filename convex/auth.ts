// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { getUserByPhone, normalizeDoc, nowTs } from "./lib/helpers";

export const upsertUserAndCreateSession = mutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
    tokenId: v.string(),
    expiresAt: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = nowTs();
    let user = await getUserByPhone(ctx, args.phone);

    if (!user) {
      const userId = await ctx.db.insert("users", {
        phone: args.phone,
        name: args.name || `Khách hàng ${args.phone.slice(Math.max(0, args.phone.length - 4))}`,
        role: "customer",
        locale: "vi",
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Không thể tạo người dùng.");
    }

    await ctx.db.insert("userSessions", {
      userId: user._id,
      tokenId: args.tokenId,
      status: "active",
      expiresAt: args.expiresAt,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      createdAt: timestamp,
    });

    return normalizeDoc(user);
  },
});

export const getSessionWithUserByTokenId = query({
  args: {
    tokenId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_tokenId", (q) => q.eq("tokenId", args.tokenId))
      .collect();
    const session = sessions[0] ?? null;

    if (!session) {
      return null;
    }

    const user = await ctx.db.get(session.userId);

    return {
      ...normalizeDoc(session),
      user: normalizeDoc(user),
    };
  },
});

export const revokeSessionByTokenId = mutation({
  args: {
    tokenId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_tokenId", (q) => q.eq("tokenId", args.tokenId))
      .collect();

    await Promise.all(
      sessions.map((session) =>
        ctx.db.patch(session._id, {
          status: "revoked",
        }),
      ),
    );

    return {
      revokedCount: sessions.length,
    };
  },
});
