import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server.js"
import type { Id, Doc } from "./_generated/dataModel.js"

const MAX_SKEW_MS = 5 * 60 * 1000 // 5 minutos

type Role = "business" | "client"
function isRole(x: unknown): x is Role {
  return x === "business" || x === "client"
}

function parsePayloadString(payload: string): {
  userId: Id<"users">
  code: string
  nonce: string
  ts: number
} {
  const obj = JSON.parse(payload)
  if (
    !obj ||
    typeof obj.userId !== "string" ||
    typeof obj.code !== "string" ||
    typeof obj.nonce !== "string" ||
    (typeof obj.ts !== "number" && typeof obj.ts !== "string")
  ) {
    throw new Error("Payload del QR inválido")
  }
  return {
    userId: obj.userId as Id<"users">,
    code: String(obj.code),
    nonce: String(obj.nonce),
    ts: typeof obj.ts === "string" ? Number(obj.ts) : obj.ts,
  }
}

async function ensureIdempotentSubscription(
  ctx: any,
  clientId: Id<"users">,
  businessId: Id<"users">,
): Promise<{ alreadySubscribed: boolean; subscriptionId: Id<"subscriptions"> }> {
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("byClient", (q: any) => q.eq("clientId", clientId))
    .filter((q: any) => q.eq(q.field("businessId"), businessId))
    .first()

  if (existing) {
    return { alreadySubscribed: true, subscriptionId: existing._id as Id<"subscriptions"> }
  }

  const subscriptionId = (await ctx.db.insert("subscriptions", {
    clientId,
    businessId,
    subscribedAt: Date.now(),
  })) as Id<"subscriptions">

  return { alreadySubscribed: false, subscriptionId }
}

async function subscribeCore(ctx: any, ownerUserId: Id<"users">, code: string, ts: number) {
  const scannerId = (await getAuthUserId(ctx)) as Id<"users"> | null
  if (!scannerId) throw new Error("Unauthorized")

  const [scanner, owner] = await Promise.all([ctx.db.get(scannerId), ctx.db.get(ownerUserId)])
  if (!scanner) throw new Error("Usuario autenticado no encontrado")
  if (!owner) throw new Error("El dueño del QR no existe")

  if (!isRole(scanner.role) || !isRole(owner.role)) {
    throw new Error("Roles inválidos. Se requieren 'business' o 'client'")
  }
  if (scanner._id === owner._id) throw new Error("No puedes suscribirte contigo mismo")

  // Verificar vigencia del QR
  const now = Date.now()
  if (Math.abs(now - ts) > MAX_SKEW_MS) {
    throw new Error("QR expirado. Pide que generen uno nuevo.")
  }

  // Verificar que el código coincida con el QR ACTIVO del owner
  const qrDoc: Doc<"qrCodes"> | null = await ctx.db
    .query("qrCodes")
    .withIndex("by_owner", (q: any) => q.eq("ownerUserId", owner._id))
    .unique()

  if (!qrDoc) throw new Error("Este usuario no tiene un QR activo")
  if (qrDoc.code !== code) throw new Error("El código no coincide con el QR activo del usuario")

  // Determinar (clientId, businessId) según roles
  let clientId: Id<"users">
  let businessId: Id<"users">

  if (owner.role === "business" && scanner.role === "client") {
    businessId = owner._id
    clientId = scanner._id
  } else if (owner.role === "client" && scanner.role === "business") {
    businessId = scanner._id
    clientId = owner._id
  } else if (owner.role === "business" && scanner.role === "business") {
    throw new Error("Dos negocios no pueden suscribirse entre sí")
  } else if (owner.role === "client" && scanner.role === "client") {
    throw new Error("Dos clientes no pueden suscribirse entre sí")
  } else {
    throw new Error("Combinación de roles inválida")
  }

  const { alreadySubscribed, subscriptionId } = await ensureIdempotentSubscription(ctx, clientId, businessId)

  return {
    success: true as const,
    alreadySubscribed,
    subscriptionId,
    clientId,
    businessId,
    // Devolvemos también información del QR activo por si quieres verificar desde el front
    qr: { ownerUserId: owner._id, code: qrDoc.code, payload: qrDoc.payload, updatedAt: qrDoc.updatedAt },
  }
}

/**
 * 1) Suscripción a partir del payload JSON del QR
 * payload: { userId, code, nonce, ts }
 */
export const subscribeFromPayload = mutation({
  args: {
    payload: v.object({
      userId: v.id("users"),
      code: v.string(),
      nonce: v.string(),
      ts: v.number(),
    }),
  },
  handler: async (ctx, { payload }) => {
    return await subscribeCore(ctx, payload.userId, payload.code, payload.ts)
  },
})

/**
 * 2) Suscripción a partir del código corto del QR
 * Busca el QR por "code" y usa su payload canónico
 */
export const subscribeByCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const qrDoc: Doc<"qrCodes"> | null = await ctx.db
      .query("qrCodes")
      .withIndex("by_code", (q: any) => q.eq("code", code))
      .unique()
    if (!qrDoc) throw new Error("Código no encontrado")

    const parsed = parsePayloadString(qrDoc.payload)
    if (parsed.code !== qrDoc.code) throw new Error("Payload inconsistente para este código")
    if (parsed.userId !== qrDoc.ownerUserId) throw new Error("El payload no corresponde al dueño del QR")

    return await subscribeCore(ctx, parsed.userId, parsed.code, parsed.ts)
  },
})

/**
 * 3) Obtener datos del QR para comprobar igualdad (dos variantes)
 */
export const getQrByOwner = query({
  args: { ownerUserId: v.id("users") },
  handler: async (ctx, { ownerUserId }) => {
    const qrDoc: Doc<"qrCodes"> | null = await ctx.db
      .query("qrCodes")
      .withIndex("by_owner", (q: any) => q.eq("ownerUserId", ownerUserId))
      .unique()
    if (!qrDoc) return null
    return { ownerUserId, code: qrDoc.code, payload: qrDoc.payload, updatedAt: qrDoc.updatedAt }
  },
})

export const getQrByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const qrDoc: Doc<"qrCodes"> | null = await ctx.db
      .query("qrCodes")
      .withIndex("by_code", (q: any) => q.eq("code", code))
      .unique()
    if (!qrDoc) return null
    return { ownerUserId: qrDoc.ownerUserId, code: qrDoc.code, payload: qrDoc.payload, updatedAt: qrDoc.updatedAt }
  },
})
