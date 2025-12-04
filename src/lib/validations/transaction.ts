import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo de transação',
  }),
  description: z.string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição muito longa'),
  category: z.string().min(1, 'Selecione uma categoria'),
  amount: z.coerce.number({
    required_error: 'Informe o valor',
    invalid_type_error: 'Valor inválido',
  })
    .positive('Valor deve ser positivo')
    .max(1000000, 'Valor muito alto'),
  transaction_date: z.date({
    required_error: 'Selecione uma data',
  }),
  payment_method: z.string().optional(),
  is_recurring: z.boolean().optional().default(false),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
