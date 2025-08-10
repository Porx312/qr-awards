import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // USERS: Clientes y Negocios
  users: defineTable({
    // Convex Auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom fields
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
 role: v.optional(
  v.union(
    v.literal("business"),
    v.literal("client")
  )
),

    // Business-specific fields
    businessName: v.optional(v.string()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    exactAddress: v.optional(v.string()),
    businessCategory: v.optional(v.string()),
    qrCode: v.optional(v.string()),

    createdAt: v.optional(v.number())
  })
    .index("email", ["email"])
    .index("role", ["role"]),
    qrCodes: defineTable({
    code: v.string(), // código corto legible
    ownerUserId: v.id("users"), // dueño del QR
    payload: v.string(), // JSON con { userId, code, nonce, ts }
    createdAt: v.number(),
    updatedAt: v.number(),
  })
   .index("by_code", ["code"])
    .index("by_owner", ["ownerUserId"]),

  rewards: defineTable({
    businessId: v.id("users"), // must be role = 'business'
    name: v.string(),
    description: v.optional(v.string()),
    requiredStamps: v.number(),
    validUntil: v.optional(v.string()), // ISO date
    createdAt: v.number()
  })
    .index("byBusiness", ["businessId"]),

  // STAMPS (puntos otorgados por un negocio a un cliente)
  stamps: defineTable({
    clientId: v.id("users"),   // must be role = 'client'
    businessId: v.id("users"), // must be role = 'business'
    quantity: v.number(),
    grantedAt: v.number()
  })
    .index("byClient", ["clientId"])
    .index("byBusiness", ["businessId"]),

  // SUBSCRIPTIONS (clientes que siguen a un negocio)
  subscriptions: defineTable({
    clientId: v.id("users"),    // role: 'client'
    businessId: v.id("users"),  // role: 'business'
    subscribedAt: v.number()
  })
    .index("byClient", ["clientId"])
    .index("byBusiness", ["businessId"]),

  // REDEMPTIONS / CANJES (cliente canjea un premio)
  redemptions: defineTable({
    clientId: v.id("users"),
    businessId: v.id("users"),
    rewardId: v.id("rewards"),
    redeemedAt: v.number()
  })
    .index("byClient", ["clientId"])
    .index("byBusiness", ["businessId"])
});

