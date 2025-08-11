import { v } from "convex/values"
import { mutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server" // Import correct MutationCtx type
import { getAuthUserId } from "@convex-dev/auth/server"
import type { Id, Doc } from "./_generated/dataModel"

interface QRPayload {
  userId: Id<"users">
  code: string
  nonce: string
  ts: number
}

interface QRData {
  ownerUserId: Id<"users">
  code: string
  payload: string
  updatedAt: number
}

interface UnifiedResult {
  success: boolean
  action: "subscribe" | "grantStamps"
  alreadySubscribed?: boolean
  subscriptionId?: Id<"subscriptions">
  stampsGranted?: number
  totalStamps?: number
  clientId: Id<"users">
  businessId: Id<"users">
  targetUser: {
    id: Id<"users">
    name?: string
    role: string
  }
  qr: QRData
}

// Función unificada que maneja tanto suscripción como otorgamiento de puntos
export const processQRAction = mutation({
  args: {
    payload: v.optional(
      v.object({
        userId: v.id("users"),
        code: v.string(),
        nonce: v.string(),
        ts: v.number(),
      }),
    ),
    code: v.optional(v.string()),
    stampsQuantity: v.number(),
  },
  handler: async (ctx, { payload, code, stampsQuantity }): Promise<UnifiedResult> => {
    // Remove explicit MutationCtx type annotation
    const currentUserId = await getAuthUserId(ctx)
    if (!currentUserId) {
      throw new Error("No autenticado")
    }

    // Obtener información del usuario actual
    const currentUser = await ctx.db.get(currentUserId)
    if (!currentUser) {
      throw new Error("Usuario no encontrado")
    }

    let qrCode
    let targetUserId: Id<"users">

    // Determinar el QR y usuario objetivo
    if (payload) {
      // Buscar por payload
      qrCode = await ctx.db
        .query("qrCodes")
        .withIndex("by_code", (q) => q.eq("code", payload.code))
        .first()

      if (!qrCode || qrCode.ownerUserId !== payload.userId) {
        throw new Error("QR inválido")
      }
      targetUserId = payload.userId
    } else if (code) {
      // Buscar por código manual
      qrCode = await ctx.db
        .query("qrCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first()

      if (!qrCode) {
        throw new Error("Código no encontrado")
      }
      targetUserId = qrCode.ownerUserId
    } else {
      throw new Error("Debe proporcionar payload o código")
    }

    // Obtener información del usuario objetivo
    const targetUser = await ctx.db.get(targetUserId)
    if (!targetUser) {
      throw new Error("Usuario objetivo no encontrado")
    }

    // Determinar la acción basada en los roles
    if (currentUser.role === "client" && targetUser.role === "business") {
      // Cliente escaneando negocio -> Suscribirse
      return await handleSubscription(ctx, currentUserId, targetUserId, qrCode)
    } else if (currentUser.role === "business" && targetUser.role === "client") {
      // Negocio escaneando cliente -> Otorgar puntos (con auto-suscripción si es necesario)
      return await handleGrantStampsWithAutoSubscribe(ctx, currentUserId, targetUserId, stampsQuantity, qrCode)
    } else {
      throw new Error("Combinación de roles no válida")
    }
  },
})

function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Manejar suscripción de cliente a negocio
async function handleSubscription(
  ctx: MutationCtx,
  clientId: Id<"users">,
  businessId: Id<"users">,
  qrCode: Doc<"qrCodes">,
): Promise<UnifiedResult> {
  // Verificar si ya existe la suscripción
  const existingSubscription = await ctx.db
    .query("subscriptions")
    .withIndex("byClient", (q) => q.eq("clientId", clientId)) // q parameter now properly typed
    .filter((q) => q.eq(q.field("businessId"), businessId))
    .first()

  const targetUser = await ctx.db.get(businessId)
  if (!targetUser) {
    throw new Error("Usuario objetivo no encontrado")
  }

  let subscriptionId: Id<"subscriptions">
  let alreadySubscribed = false

  if (existingSubscription) {
    subscriptionId = existingSubscription._id
    alreadySubscribed = true
  } else {
    // Crear la suscripción
    subscriptionId = await ctx.db.insert("subscriptions", {
      clientId,
      businessId,
      subscribedAt: Date.now(),
    })
  }

  const pointsToGrant = 1
  let totalStamps = pointsToGrant

  const existingStamp = await ctx.db
    .query("stamps")
    .withIndex("byClient", (q) => q.eq("clientId", clientId))
    .filter((q) => q.eq(q.field("businessId"), businessId))
    .first()

  if (existingStamp) {
    const now = Date.now()
    const lastScanTime = existingStamp.grantedAt

    if (isSameDay(now, lastScanTime)) {
      // Ya escaneó hoy, no otorgar puntos adicionales
      return {
        success: false,
        action: "subscribe",
        alreadySubscribed: true,
        subscriptionId: existingSubscription?._id,
        stampsGranted: 0,
        totalStamps: existingStamp.quantity,
        clientId,
        businessId,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          role: targetUser.role || "business",
        },
        qr: {
          ownerUserId: qrCode.ownerUserId,
          code: qrCode.code,
          payload: qrCode.payload,
          updatedAt: qrCode.updatedAt,
        },
      }
    }

    totalStamps = existingStamp.quantity + pointsToGrant
    // Actualizar el registro existente
    await ctx.db.patch(existingStamp._id, {
      quantity: totalStamps,
      grantedAt: Date.now(),
    })
  } else {
    // Crear nuevo registro
    totalStamps = pointsToGrant
    await ctx.db.insert("stamps", {
      clientId,
      businessId,
      quantity: totalStamps,
      grantedAt: Date.now(),
    })
  }

  return {
    success: true,
    action: "subscribe",
    alreadySubscribed,
    subscriptionId,
    stampsGranted: pointsToGrant,
    totalStamps,
    clientId,
    businessId,
    targetUser: {
      id: targetUser._id,
      name: targetUser.name,
      role: targetUser.role || "business", // Provide default value for undefined role
    },
    qr: {
      ownerUserId: qrCode.ownerUserId,
      code: qrCode.code,
      payload: qrCode.payload,
      updatedAt: qrCode.updatedAt,
    },
  }
}

// Manejar otorgamiento de puntos con auto-suscripción
async function handleGrantStampsWithAutoSubscribe(
  ctx: MutationCtx,
  businessId: Id<"users">,
  clientId: Id<"users">,
  quantity: number,
  qrCode: Doc<"qrCodes">,
): Promise<UnifiedResult> {
  // Validar cantidad
  if (quantity < 1 || quantity > 10) {
    throw new Error("La cantidad debe ser entre 1 y 10 puntos")
  }

  // Verificar si existe la suscripción
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("byClient", (q) => q.eq("clientId", clientId)) // q parameter now properly typed
    .filter((q) => q.eq(q.field("businessId"), businessId))
    .first()

  // Si no existe suscripción, crearla automáticamente
  if (!subscription) {
    await ctx.db.insert("subscriptions", {
      clientId,
      businessId,
      subscribedAt: Date.now(),
    })
  }

  let totalStamps = quantity

  const existingStamp = await ctx.db
    .query("stamps")
    .withIndex("byClient", (q) => q.eq("clientId", clientId))
    .filter((q) => q.eq(q.field("businessId"), businessId))
    .first()

  if (existingStamp) {
    totalStamps = existingStamp.quantity + quantity
    // Actualizar el registro existente
    await ctx.db.patch(existingStamp._id, {
      quantity: totalStamps,
      grantedAt: Date.now(),
    })
  } else {
    // Crear nuevo registro
    totalStamps = quantity
    await ctx.db.insert("stamps", {
      clientId,
      businessId,
      quantity: totalStamps,
      grantedAt: Date.now(),
    })
  }

  const targetUser = await ctx.db.get(clientId)
  if (!targetUser) {
    throw new Error("Usuario cliente no encontrado")
  }

  return {
    success: true,
    action: "grantStamps",
    stampsGranted: quantity,
    totalStamps,
    clientId,
    businessId,
    targetUser: {
      id: targetUser._id,
      name: targetUser.name,
      role: targetUser.role || "client", // Provide default value for undefined role
    },
    qr: {
      ownerUserId: qrCode.ownerUserId,
      code: qrCode.code,
      payload: qrCode.payload,
      updatedAt: qrCode.updatedAt,
    },
  }
}
