import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

// Otorgar puntos usando payload de QR
export const grantStampsFromPayload = mutation({
  args: {
    payload: v.object({
      userId: v.id("users"),
      code: v.string(),
      nonce: v.string(),
      ts: v.number(),
    }),
    quantity: v.number(),
  },
  handler: async (ctx, { payload, quantity }) => {
    const businessId = await getAuthUserId(ctx)
    if (!businessId) {
      throw new Error("No autenticado")
    }

    // Verificar que el usuario actual es un negocio
    const business = await ctx.db.get(businessId)
    if (!business || business.role !== "business") {
      throw new Error("Solo los negocios pueden otorgar puntos")
    }

    // Verificar que el QR existe y pertenece al cliente
    const qrCode = await ctx.db
      .query("qrCodes")
      .withIndex("by_code", (q) => q.eq("code", payload.code))
      .first()

    if (!qrCode || qrCode.ownerUserId !== payload.userId) {
      throw new Error("QR inválido o no pertenece al cliente")
    }

    // Verificar que el cliente existe y tiene rol de cliente
    const client = await ctx.db.get(payload.userId)
    if (!client || client.role !== "client") {
      throw new Error("Cliente no válido")
    }

    // Validar cantidad
    if (quantity < 1 || quantity > 10) {
      throw new Error("La cantidad debe ser entre 1 y 10 puntos")
    }

    // Otorgar los puntos
    await ctx.db.insert("stamps", {
      clientId: payload.userId,
      businessId,
      quantity,
      grantedAt: Date.now(),
    })

    // Calcular total de puntos del cliente con este negocio
    const allStamps = await ctx.db
      .query("stamps")
      .withIndex("byClient", (q) => q.eq("clientId", payload.userId))
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .collect()

    const totalStamps = allStamps.reduce((sum, stamp) => sum + stamp.quantity, 0)

    return {
      success: true,
      stampsGranted: quantity,
      totalStamps,
      clientId: payload.userId,
      businessId,
      qr: {
        ownerUserId: qrCode.ownerUserId,
        code: qrCode.code,
        payload: qrCode.payload,
        updatedAt: qrCode.updatedAt,
      },
    }
  },
})

// Otorgar puntos usando código manual
export const grantStampsByCode = mutation({
  args: {
    code: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, { code, quantity }) => {
    const businessId = await getAuthUserId(ctx)
    if (!businessId) {
      throw new Error("No autenticado")
    }

    // Verificar que el usuario actual es un negocio
    const business = await ctx.db.get(businessId)
    if (!business || business.role !== "business") {
      throw new Error("Solo los negocios pueden otorgar puntos")
    }

    // Buscar el QR por código
    const qrCode = await ctx.db
      .query("qrCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first()

    if (!qrCode) {
      throw new Error("Código no encontrado")
    }

    // Verificar que el cliente existe y tiene rol de cliente
    const client = await ctx.db.get(qrCode.ownerUserId)
    if (!client || client.role !== "client") {
      throw new Error("Cliente no válido")
    }

    // Validar cantidad
    if (quantity < 1 || quantity > 10) {
      throw new Error("La cantidad debe ser entre 1 y 10 puntos")
    }

    // Otorgar los puntos
    await ctx.db.insert("stamps", {
      clientId: qrCode.ownerUserId,
      businessId,
      quantity,
      grantedAt: Date.now(),
    })

    // Calcular total de puntos del cliente con este negocio
    const allStamps = await ctx.db
      .query("stamps")
      .withIndex("byClient", (q) => q.eq("clientId", qrCode.ownerUserId))
      .filter((q) => q.eq(q.field("businessId"), businessId))
      .collect()

    const totalStamps = allStamps.reduce((sum, stamp) => sum + stamp.quantity, 0)

    return {
      success: true,
      stampsGranted: quantity,
      totalStamps,
      clientId: qrCode.ownerUserId,
      businessId,
    }
  },
})

// Consultar puntos de un cliente en un negocio específico
export const getClientStamps = query({
  args: {
    clientId: v.id("users"),
    businessId: v.optional(v.id("users")),
  },
  handler: async (ctx, { clientId, businessId }) => {
    let query = ctx.db.query("stamps").withIndex("byClient", (q) => q.eq("clientId", clientId))

    if (businessId) {
      query = query.filter((q) => q.eq(q.field("businessId"), businessId))
    }

    const stamps = await query.collect()
    const totalStamps = stamps.reduce((sum, stamp) => sum + stamp.quantity, 0)

    return {
      stamps,
      totalStamps,
    }
  },
})

// Consultar historial de puntos otorgados por un negocio
export const getBusinessStampsHistory = query({
  args: {
    businessId: v.optional(v.id("users")),
  },
  handler: async (ctx, { businessId }) => {
    const currentBusinessId = businessId || (await getAuthUserId(ctx))
    if (!currentBusinessId) {
      throw new Error("No autenticado")
    }

    const stamps = await ctx.db
      .query("stamps")
      .withIndex("byBusiness", (q) => q.eq("businessId", currentBusinessId))
      .order("desc")
      .take(50) // Últimos 50 registros

    // Obtener información de los clientes
    const stampsWithClients = await Promise.all(
      stamps.map(async (stamp) => {
        const client = await ctx.db.get(stamp.clientId)
        return {
          ...stamp,
          client: {
            id: client?._id,
            name: client?.name,
            email: client?.email,
          },
        }
      }),
    )

    return stampsWithClients
  },
})
// Get stamps given by a business
export const getBusinessStamps = query({
  args: { businessId: v.id("users") },
  handler: async (ctx, { businessId }) => {
    const stamps = await ctx.db
      .query("stamps")
      .withIndex("byBusiness", (q) => q.eq("businessId", businessId))
      .collect()

    // Get client info for each stamp
    const stampsWithClients = await Promise.all(
      stamps.map(async (stamp) => {
        const client = await ctx.db.get(stamp.clientId)
        return { ...stamp, client }
      }),
    )

    return stampsWithClients
  },
})