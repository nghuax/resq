// @ts-nocheck
import { query } from "./_generated/server";
import { v } from "convex/values";

import { getFixerProfileByUserId, normalizeDoc, sortCreatedDesc } from "./lib/helpers";

export const listServiceTypes = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("serviceTypes")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    return [...items]
      .sort((left, right) => {
        if (left.isFuelService === right.isFuelService) {
          return left.basePriceVnd - right.basePriceVnd;
        }

        return Number(left.isFuelService) - Number(right.isFuelService);
      })
      .map((item) => normalizeDoc(item));
  },
});

export const listPricingRulesWithServices = query({
  args: {},
  handler: async (ctx) => {
    const pricingRules = sortCreatedDesc(await ctx.db.query("pricingRules").collect());

    return Promise.all(
      pricingRules.map(async (rule) => {
        const serviceType = await ctx.db.get(rule.serviceTypeId);

        return {
          ...normalizeDoc(rule),
          serviceType: normalizeDoc(serviceType),
        };
      }),
    );
  },
});

export const listServiceAreaRules = query({
  args: {},
  handler: async (ctx) => {
    const rules = await ctx.db.query("serviceAreaRules").collect();

    return [...rules]
      .sort((left, right) =>
        `${left.cityProvince}-${left.district ?? ""}`.localeCompare(
          `${right.cityProvince}-${right.district ?? ""}`,
          "vi",
        ),
      )
      .map((item) => normalizeDoc(item));
  },
});

export const getFixerProfileByUserIdQuery = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return normalizeDoc(await getFixerProfileByUserId(ctx, args.userId));
  },
});
