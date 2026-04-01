// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import {
  appendStatusLog,
  cleanString,
  getInvoiceByRequestId,
  hydrateFixer,
  hydrateRequest,
  nowTs,
  sortCreatedDesc,
} from "./lib/helpers";

export const listAdminRequests = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requests = sortCreatedDesc(await ctx.db.query("requests").collect()).filter(
      (request) => (args.status ? request.status === args.status : true),
    );

    return Promise.all(requests.map((request) => hydrateRequest(ctx, request)));
  },
});

export const listFixerCandidates = query({
  args: {},
  handler: async (ctx) => {
    const fixers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "fixer"))
      .collect();

    return Promise.all(
      [...fixers]
        .filter((fixer) => fixer.isActive)
        .sort((left, right) => left.name.localeCompare(right.name, "vi"))
        .map((fixer) => hydrateFixer(ctx, fixer)),
    );
  },
});

export const assignFixerToRequest = mutation({
  args: {
    requestId: v.id("requests"),
    fixerUserId: v.id("users"),
    actorUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const [request, fixer] = await Promise.all([
      ctx.db.get(args.requestId),
      ctx.db.get(args.fixerUserId),
    ]);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    if (["completed", "cancelled"].includes(request.status)) {
      throw new Error("Không thể gán fixer cho yêu cầu đã kết thúc.");
    }

    if (!fixer || fixer.role !== "fixer" || !fixer.isActive) {
      throw new Error("Fixer không hợp lệ.");
    }

    const timestamp = nowTs();

    await ctx.db.patch(request._id, {
      assignedFixerId: fixer._id,
      status: "fixer_matched",
      updatedAt: timestamp,
    });

    await appendStatusLog(ctx, {
      requestId: request._id,
      status: "fixer_matched",
      actorUserId: args.actorUserId,
      descriptionVi: `${fixer.name} đã được gán cho yêu cầu này.`,
      createdAt: timestamp,
    });

    return hydrateRequest(ctx, await ctx.db.get(request._id));
  },
});

export const updateRequestStatusByAdmin = mutation({
  args: {
    requestId: v.id("requests"),
    actorUserId: v.id("users"),
    status: v.string(),
    note: v.optional(v.string()),
    etaMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu.");
    }

    if (
      ["completed", "cancelled"].includes(request.status) &&
      request.status === args.status
    ) {
      return hydrateRequest(ctx, request);
    }

    const invoice = await getInvoiceByRequestId(ctx, request._id);
    const timestamp = nowTs();

    await ctx.db.patch(request._id, {
      status: args.status as any,
      cancelledAt: args.status === "cancelled" ? timestamp : undefined,
      completedAt: args.status === "completed" ? timestamp : undefined,
      cancelReason: args.status === "cancelled" ? cleanString(args.note) : undefined,
      finalPriceVnd:
        args.status === "completed"
          ? request.finalPriceVnd ?? invoice?.totalVnd ?? request.priceEstimateVnd
          : request.finalPriceVnd,
      updatedAt: timestamp,
    });

    await appendStatusLog(ctx, {
      requestId: request._id,
      status: args.status,
      actorUserId: args.actorUserId,
      descriptionVi: args.note,
      etaMinutes: args.etaMinutes,
      createdAt: timestamp,
    });

    return hydrateRequest(ctx, await ctx.db.get(request._id));
  },
});
