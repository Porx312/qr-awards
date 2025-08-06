import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(32, { message: "Username must be at most 32 characters." })
    .regex(/^[a-z0-9]+$/, {
      message: "Username may only contain lowercase letters and numbers.",
    })
    .transform((val) => val.trim().toLowerCase())
    .optional(),

  role: z.enum(["client", "business"]).optional(),

  // Campos para negocio
  businessName: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  exactAddress: z.string().min(1).max(200).optional(),
  businessCategory: z.string().min(1).max(50).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
