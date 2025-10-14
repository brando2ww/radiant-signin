import { z } from 'zod';

export const creditCardSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome muito longo'),
  brand: z.enum(['visa', 'mastercard', 'elo', 'amex', 'hipercard', 'other'], {
    required_error: 'Selecione a bandeira',
  }),
  last_four_digits: z.string()
    .length(4, 'Deve ter 4 dígitos')
    .regex(/^\d+$/, 'Apenas números')
    .optional()
    .or(z.literal('')),
  credit_limit: z.number()
    .positive('Limite deve ser positivo')
    .max(1000000, 'Limite muito alto'),
  due_day: z.number()
    .min(1, 'Dia inválido')
    .max(31, 'Dia inválido'),
  closing_day: z.number()
    .min(1, 'Dia inválido')
    .max(31, 'Dia inválido'),
  color: z.string().min(1, 'Selecione uma cor'),
}).refine(
  (data) => data.closing_day !== data.due_day,
  {
    message: 'Dia de fechamento deve ser diferente do vencimento',
    path: ['closing_day'],
  }
);

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
