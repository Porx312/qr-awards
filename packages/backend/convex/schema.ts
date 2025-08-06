import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Convex Auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // custom fields
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),

  // common custom fields
role: v.optional(v.union(v.literal("business"), v.literal("client"))),


  // fields for businesses
  businessName: v.optional(v.string()),
  location: v.optional(v.string()),
  city: v.optional(v.string()),
  exactAddress: v.optional(v.string()),
  businessCategory: v.optional(v.string()),
  }).index("email", ["email"]),
});
