import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { z } from "zod"; // Importa Zod
import { createRewardFormSchema, updateRewardFormSchema } from "./utils/reward";

// Esquema de validación para premios (ya no es necesario definirlo aquí si usas Zod)
// const rewardSchema = {
//   businessId: v.id("users"),
//   name: v.string(),
//   description: v.optional(v.string()),
//   requiredStamps: v.number(),
//   validUntil: v.optional(v.string()),
//   createdAt: v.number(),
// };

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
  // Define los argumentos de Convex para que coincidan con el esquema de Zod
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

    // Validar los argumentos de entrada con Zod
    const validatedArgs = createRewardFormSchema.parse(args);

    // Crear el premio
    const rewardId = await ctx.db.insert("rewards", {
      businessId: userId,
      name: validatedArgs.name,
      description: validatedArgs.description,
      requiredStamps: validatedArgs.requiredStamps,
      validUntil: validatedArgs.validUntil,
      createdAt: Date.now(),
    });
    return { id: rewardId, message: "Premio creado exitosamente" };
  },
});

// Actualizar un premio existente
export const updateReward = mutation({
  // Define los argumentos de Convex para que coincidan con el esquema de Zod
  args: {
    rewardId: v.id("rewards"), // El ID del premio sigue siendo necesario
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

    // Validar los argumentos de entrada con Zod (excluyendo rewardId para la validación del esquema)
    const { rewardId, ...updateFields } = args;
    const validatedUpdateFields = updateRewardFormSchema.parse(updateFields);

    // Actualizar los campos proporcionados
    await ctx.db.patch(args.rewardId, {
      name: validatedUpdateFields.name ?? reward.name,
      description: validatedUpdateFields.description ?? reward.description,
      requiredStamps: validatedUpdateFields.requiredStamps ?? reward.requiredStamps,
      validUntil: validatedUpdateFields.validUntil ?? reward.validUntil,
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