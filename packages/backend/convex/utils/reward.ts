import { z } from "zod";

// Esquema base para los campos del premio
const baseRewardSchema = z.object({
  name: z.string().min(1, "El nombre del premio es obligatorio."),
  description: z.string().optional(),
  requiredStamps: z.coerce.number()
    .int("Los sellos requeridos deben ser un número entero.")
    .positive("Los sellos requeridos deben ser un número positivo."),
  validUntil: z.string().optional(), // Se espera un string en formato ISO (YYYY-MM-DD)
});

// Esquema para la creación de un premio (todos los campos son requeridos según la UI, excepto los opcionales)
export const createRewardFormSchema = baseRewardSchema;

// Esquema para la actualización de un premio (todos los campos son opcionales)
export const updateRewardFormSchema = baseRewardSchema.partial();

export type CreateRewardFormInput = z.infer<typeof createRewardFormSchema>;
export type UpdateRewardFormInput = z.infer<typeof updateRewardFormSchema>;

// Tipo para los datos de un premio tal como vienen de Convex (incluye _id, _creationTime, etc.)
export interface Reward {
  _id: string;
  _creationTime: number;
  businessId: string;
  name: string;
  description?: string;
  requiredStamps: number;
  validUntil?: string; // ISO date string
  createdAt: number;
}
