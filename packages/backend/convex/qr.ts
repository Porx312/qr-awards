// Convex QR backend: upsert + lectura con tipos correctos.

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function randomCode(len = 8) {
  let res = ""
  for (let i = 0; i < len; i++) {
    res += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return res
}

export const generateUserQr = mutation({
  args: { ownerUserId: v.id("users") },
  handler: async (ctx, args) => {
    const code = randomCode(8)
    const payloadObj = {
      userId: args.ownerUserId,
      code,
      nonce: [Math.random().toString(36).slice(2), Date.now().toString(36)].join("-"),
      ts: Date.now(),
    }
    const payload = JSON.stringify(payloadObj)

    // Upsert en qrCodes por ownerUserId
    const existing: Doc<"qrCodes"> | null = await ctx.db
      .query("qrCodes")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerUserId))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { code, payload, updatedAt: Date.now() })
    } else {
      await ctx.db.insert("qrCodes", {
        code,
        ownerUserId: args.ownerUserId,
        payload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Opcional: guarda el payload también en el doc del usuario (si te sirve como fallback)
    await ctx.db.patch(args.ownerUserId, { qrCode: payload, createdAt: Date.now() })

    return { ok: true, ownerUserId: args.ownerUserId, code, payload }
  },
})

export const getUserQr = query({
  args: { ownerUserId: v.id("users") },
  handler: async (ctx, args) => {
    // 1) Leer desde qrCodes por owner (solo lectura)
    const byOwner: Doc<"qrCodes"> | null = await ctx.db
      .query("qrCodes")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerUserId))
      .unique()

    if (byOwner) {
      return {
        ownerUserId: args.ownerUserId,
        code: byOwner.code,
        payload: byOwner.payload,
      }
    }

    // 2) Fallback: si guardaste el payload en users.qrCode, úsalo
    const user = await ctx.db.get(args.ownerUserId)
    if (user?.qrCode) {
      try {
        const parsed = JSON.parse(user.qrCode as string)
        return {
          ownerUserId: args.ownerUserId,
          code: parsed?.code ?? "SIN-CODIGO",
          payload: user.qrCode as string,
        }
      } catch {
        // no es JSON válido, no devolvemos nada
      }
    }

    // 3) Aún no hay QR
    return null
  },
})
