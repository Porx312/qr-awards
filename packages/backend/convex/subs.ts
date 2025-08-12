import { getAuthUserId } from "@convex-dev/auth/server"
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Obtiene las suscripciones agregadas de un cliente con stamps y rewards
export const getClientSubscriptionsAggregated = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const user = await ctx.db.get(userId)
    if (!user || user.role !== "client") return null

    // Obtener suscripciones del cliente
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("byClient", (q) => q.eq("clientId", userId))
      .collect()

    const aggregatedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        // Obtener información del negocio
        const business = await ctx.db.get(sub.businessId)
        if (!business) return null

        // Obtener stamps del cliente para este negocio
        const stamps = await ctx.db
          .query("stamps")
          .withIndex("byClient", (q) => q.eq("clientId", userId))
          .filter((q) => q.eq(q.field("businessId"), sub.businessId))
          .collect()

        const totalStamps = stamps.reduce((sum, stamp) => sum + stamp.quantity, 0)

        // Obtener rewards del negocio
        const rewards = await ctx.db
          .query("rewards")
          .withIndex("byBusiness", (q) => q.eq("businessId", sub.businessId))
          .collect()

        // Obtener redemptions del cliente para este negocio
        const redemptions = await ctx.db
          .query("redemptions")
          .withIndex("byClient", (q) => q.eq("clientId", userId))
          .filter((q) => q.eq(q.field("businessId"), sub.businessId))
          .collect()

        // Calcular rewards agregados
        const aggregatedRewards = rewards.map((reward) => {
          // Contar cuántas veces se ha canjeado esta recompensa
          const timesRedeemed = redemptions.filter((r) => r.rewardId === reward._id).length

          // Los stamps disponibles son los totales menos los usados en canjes previos
          const stampsUsedInRedemptions = timesRedeemed * reward.requiredStamps
          const availableStamps = Math.max(0, totalStamps - stampsUsedInRedemptions)

          const progress = Math.min(availableStamps, reward.requiredStamps)
          const canRedeem = progress >= reward.requiredStamps

          return {
            rewardId: reward._id,
            name: reward.name,
            description: reward.description,
            requiredStamps: reward.requiredStamps,
            validUntil: reward.validUntil,
            progress,
            canRedeem,
          }
        })

        // Ordenar rewards por progreso (más cercanos a completar primero)
        aggregatedRewards.sort((a, b) => {
          if (a.canRedeem && !b.canRedeem) return -1
          if (!a.canRedeem && b.canRedeem) return 1
          return b.progress / b.requiredStamps - a.progress / a.requiredStamps
        })

        return {
          clientId: userId,
          business: {
            businessId: business._id,
            businessName: business.businessName || business.name || "Negocio sin nombre",
            businessCategory: business.businessCategory || "Sin categoría",
            city: business.city || "Sin ubicación",
            image: business.image,
          },
          totalStamps,
          rewards: aggregatedRewards,
        }
      }),
    )

    // Filtrar nulls y retornar
    const validSubscriptions = aggregatedSubscriptions.filter(Boolean)

    return {
      clientId: userId,
      subscriptions: validSubscriptions,
    }
  },
})

export const redeemReward = mutation({
  args: {
    businessId: v.id("users"),
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, { businessId, rewardId }): Promise<any> => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("No autenticado")

    const user = await ctx.db.get(userId)
    if (!user || user.role !== "client") {
      throw new Error("Solo los clientes pueden canjear recompensas")
    }

    // Verificar que la recompensa existe y pertenece al negocio
    const reward = await ctx.db.get(rewardId)
    if (!reward || reward.businessId !== businessId) {
      throw new Error("Recompensa no encontrada")
    }

    // Verificar que el cliente está suscrito al negocio
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("byClient", (q) => q.eq("clientId", userId))
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .first()

    if (!subscription) {
      throw new Error("No estás suscrito a este negocio")
    }

    // Obtener stamps del cliente para este negocio
    const stamps = await ctx.db
      .query("stamps")
      .withIndex("byClient", (q) => q.eq("clientId", userId))
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .collect()

    const totalStamps = stamps.reduce((sum, stamp) => sum + stamp.quantity, 0)

    // Verificar que tiene suficientes stamps
    if (totalStamps < reward.requiredStamps) {
      throw new Error(
        `Necesitas ${reward.requiredStamps} sellos, pero solo tienes ${totalStamps} disponibles`
      )
    }

    // Verificar validez de la recompensa
    if (reward.validUntil) {
      const validUntilDate = new Date(reward.validUntil)
      if (validUntilDate < new Date()) {
        throw new Error("Esta recompensa ha expirado")
      }
    }

    // Crear el canje
    await ctx.db.insert("redemptions", {
      clientId: userId,
      businessId,
      rewardId,
      redeemedAt: Date.now(),
    })

    // Reducir la cantidad de stamps
    let stampsToRemove = reward.requiredStamps

    // Vamos recorriendo los registros de stamps y restando
    for (const stamp of stamps) {
      if (stampsToRemove <= 0) break

      const deduction = Math.min(stamp.quantity, stampsToRemove)

      await ctx.db.patch(stamp._id, {
        quantity: stamp.quantity - deduction,
      })

      stampsToRemove -= deduction
    }

    return await ctx.runQuery(api.subs.getClientSubscriptionsAggregated)
  },
})
