import { getAuthUserId } from "@convex-dev/auth/server"
import { query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import { v } from "convex/values"

// Devuelve las suscripciones "del otro lado" según el rol del usuario.
// - client -> lista de negocios a los que está suscrito
// - business -> lista de clientes suscritos
export const mySubscriptionsDetailed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const me = await ctx.db.get(userId)
    if (!me) return null

    if (me.role === "client") {
      const subs = await ctx.db
        .query("subscriptions")
        .withIndex("byClient", (q) => q.eq("clientId", me._id))
        .collect()

      // Obtener los negocios (usuarios con _id = businessId)
      const items = await Promise.all(
        subs.map(async (s) => {
          const other = (await ctx.db.get(s.businessId)) as Doc<"users"> | null
          return {
            subscriptionId: s._id,
            subscribedAt: s.subscribedAt,
            otherUser: other
              ? {
                  _id: other._id,
                  role: other.role,
                  username: other.username,
                  name: other.name,
                  businessName: (other as any).businessName,
                  avatarImageId: other.imageId,
                }
              : null,
          }
        }),
      )

      return {
        role: "client" as const,
        items,
        count: subs.length,
      }
    }

    if (me.role === "business") {
      const subs = await ctx.db
        .query("subscriptions")
        .withIndex("byBusiness", (q) => q.eq("businessId", me._id))
        .collect()

      // Obtener los clientes (usuarios con _id = clientId)
      const items = await Promise.all(
        subs.map(async (s) => {
          const other = (await ctx.db.get(s.clientId)) as Doc<"users"> | null
          return {
            subscriptionId: s._id,
            subscribedAt: s.subscribedAt,
            otherUser: other
              ? {
                  _id: other._id,
                  role: other.role,
                  username: other.username,
                  name: other.name,
                  avatarImageId: other.imageId,
                }
              : null,
          }
        }),
      )

      return {
        role: "business" as const,
        items,
        count: subs.length,
      }
    }

    // Rol desconocido o no seteado
    return {
      role: me.role ?? "unknown",
      items: [],
      count: 0,
    }
  },
})
// Get business subscribers
export const getBusinessSubscribers = query({
  args: { businessId: v.id("users") },
  handler: async (ctx, { businessId }) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("byBusiness", (q) => q.eq("businessId", businessId))
      .collect()

    const subscribersWithClients = await Promise.all(
      subscriptions.map(async (sub) => {
        const client = await ctx.db.get(sub.clientId)
        return { ...sub, client }
      }),
    )

    return subscribersWithClients
  },
})
