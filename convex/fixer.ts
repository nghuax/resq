// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import {
  appendStatusLog,
  getFixerProfileByUserId,
  getInvoiceByRequestId,
  hydrateRequest,
  normalizeDoc,
  nowTs,
  sortCreatedDesc,
} from "./lib/helpers";

export const listFixerJobs = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const jobs = sortCreatedDesc(
      await ctx.db
        .query("requests")
        .withIndex("by_assignedFixerId", (q) => q.eq("assignedFixerId", args.userId))
        .collect(),
    );

    return Promise.all(jobs.map((job) => hydrateRequest(ctx, job)));
  },
});

export const getFixerJobDetail = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.assignedFixerId !== args.userId) {
      throw new Error("Yêu cầu này chưa được giao cho bạn.");
    }

    return hydrateRequest(ctx, request);
  },
});

export const updateFixerJobStatus = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("requests"),
    status: v.string(),
    note: v.optional(v.string()),
    etaMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request || request.assignedFixerId !== args.userId) {
      throw new Error("Yêu cầu này chưa được giao cho bạn.");
    }

    if (request.status === "cancelled") {
      throw new Error("Không thể cập nhật yêu cầu đã hủy.");
    }

    const invoice = await getInvoiceByRequestId(ctx, request._id);
    const timestamp = nowTs();

    await ctx.db.patch(request._id, {
      status: args.status as any,
      completedAt: args.status === "completed" ? timestamp : undefined,
      finalPriceVnd:
        args.status === "completed"
          ? request.finalPriceVnd ?? invoice?.totalVnd ?? request.priceEstimateVnd
          : request.finalPriceVnd,
      updatedAt: timestamp,
    });

    await appendStatusLog(ctx, {
      requestId: request._id,
      status: args.status,
      actorUserId: args.userId,
      descriptionVi: args.note,
      etaMinutes: args.etaMinutes,
      createdAt: timestamp,
    });

    if (args.status === "completed") {
      const profile = await getFixerProfileByUserId(ctx, args.userId);

      if (profile) {
        await ctx.db.patch(profile._id, {
          totalJobs: profile.totalJobs + 1,
          updatedAt: timestamp,
        });
      }
    }

    return hydrateRequest(ctx, await ctx.db.get(request._id));
  },
});

export const getFixerProfileForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return normalizeDoc(await getFixerProfileByUserId(ctx, args.userId));
  },
});
