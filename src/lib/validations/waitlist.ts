import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
  company_name: z.string().optional(),
  monthly_revenue: z.string().optional(),
  main_challenge: z.string().min(10, "Descreva seu desafio em pelo menos 10 caracteres"),
  terms_accepted: z.boolean().refine(val => val === true, "Você precisa aceitar os termos"),
  referred_by: z.string().optional(),
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
