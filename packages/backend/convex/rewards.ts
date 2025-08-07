import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Esquema de validación para premios (puedes mover esto a utils/validators si prefieres)
const rewardSchema = {
  businessId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  requiredStamps: v.number(),
  validUntil: v.optional(v.string()),
  createdAt: v.number(),
};

// Consultar todos los premios de un negocio
export const getRewardsByBusiness = query({
  args: { businessId: v.id("users") },
  handler: async (ctx, args) => {
    // Obtener el usuario autenticado
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Verificar que el usuario tiene rol de negocio (si tu esquema de usuarios incluye un campo 'role')
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "business") {
      throw new Error("Solo los negocios pueden consultar premios");
    }

    // Consultar los premios del negocio especificado
    const rewards = await ctx.db
      .query("rewards")
      .withIndex("byBusiness", (q) => q.eq("businessId", args.businessId))
      .collect();

    return rewards;
  },
});

// Crear un nuevo premio
export const createReward = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    requiredStamps: v.number(),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Obtener el usuario autenticado
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Verificar que el usuario es un negocio
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "business") {
      throw new Error("Solo los negocios pueden crear premios");
    }

    // Crear el premio
    const rewardId = await ctx.db.insert("rewards", {
      businessId: userId,
      name: args.name,
      description: args.description,
      requiredStamps: args.requiredStamps,
      validUntil: args.validUntil,
      createdAt: Date.now(),
    });

    return { id: rewardId, message: "Premio creado exitosamente" };
  },
});

// Actualizar un premio existente
export const updateReward = mutation({
  args: {
    rewardId: v.id("rewards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredStamps: v.optional(v.number()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Obtener el usuario autenticado
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Obtener el premio
    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Premio no encontrado");
    }

    // Verificar que el usuario es el dueño del premio (negocio)
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "business" || reward.businessId !== userId) {
      throw new Error("No tienes permiso para actualizar este premio");
    }

    // Actualizar los campos proporcionados
    await ctx.db.patch(args.rewardId, {
      name: args.name ?? reward.name,
      description: args.description ?? reward.description,
      requiredStamps: args.requiredStamps ?? reward.requiredStamps,
      validUntil: args.validUntil ?? reward.validUntil,
    });

    return { message: "Premio actualizado exitosamente" };
  },
});

// Eliminar un premio
export const deleteReward = mutation({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    // Obtener el usuario autenticado
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No estás autenticado");
    }

    // Obtener el premio
    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Premio no encontrado");
    }

    // Verificar que el usuario es el dueño del premio (negocio)
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "business" || reward.businessId !== userId) {
      throw new Error("No tienes permiso para eliminar este premio");
    }

    // Eliminar el premio
    await ctx.db.delete(args.rewardId);

    return { message: "Premio eliminado exitosamente" };
  },
});

// Consultar un premio específico por ID (opcional, útil para clientes o negocios)
export const getRewardById = query({
  args: { rewardId: v.id("rewards") },
  handler: async (ctx, args) => {
    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new Error("Premio no encontrado");
    }
    return reward;
  },
});