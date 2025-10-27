import { z } from "zod";

export const metaPixelSchema = z.object({
  meta_pixel_id: z.string()
    .trim()
    .regex(/^\d{15,16}$/, "ID do Meta Pixel deve ter 15-16 dígitos numéricos")
    .optional()
    .or(z.literal("")),
});

export const googleTagSchema = z.object({
  google_tag_id: z.string()
    .trim()
    .regex(/^(GTM-[A-Z0-9]{7}|G-[A-Z0-9]{10})$/, "ID deve ser no formato GTM-XXXXXXX ou G-XXXXXXXXXX")
    .optional()
    .or(z.literal("")),
});

export const marketingSettingsSchema = z.object({
  meta_pixel_id: z.string().trim().optional().refine(
    (val) => !val || /^\d{15,16}$/.test(val),
    { message: "ID do Meta Pixel deve ter 15-16 dígitos numéricos" }
  ),
  google_tag_id: z.string().trim().optional().refine(
    (val) => !val || /^(GTM-[A-Z0-9]{7}|G-[A-Z0-9]{10})$/.test(val),
    { message: "ID deve ser no formato GTM-XXXXXXX ou G-XXXXXXXXXX" }
  ),
});

export type MarketingSettings = z.infer<typeof marketingSettingsSchema>;