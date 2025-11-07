import { z } from 'zod';

export const invoiceDataSchema = z.object({
  invoiceKey: z.string().length(44, 'Chave NFe deve ter 44 dígitos'),
  invoiceNumber: z.string().min(1, 'Número é obrigatório'),
  series: z.string().min(1, 'Série é obrigatória'),
  emissionDate: z.date({
    required_error: 'Data de emissão é obrigatória',
  }),
  entryDate: z.date({
    required_error: 'Data de entrada é obrigatória',
  }),
  operationType: z.enum(['entrada', 'saida']),
  totals: z.object({
    products: z.number().positive('Total de produtos deve ser positivo'),
    tax: z.number().min(0, 'Total de impostos não pode ser negativo'),
    invoice: z.number().positive('Total da nota deve ser positivo'),
    freight: z.number().min(0),
    insurance: z.number().min(0),
    otherExpenses: z.number().min(0),
    discount: z.number().min(0),
  }),
  notes: z.string().optional(),
});

export const supplierDataSchema = z.object({
  mode: z.enum(['existing', 'new']),
  existingId: z.string().uuid().optional(),
  newData: z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    company_name: z.string().optional(),
    cnpj: z.string().optional(),
    state_registration: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
  }).optional(),
}).refine(data => {
  if (data.mode === 'existing') return !!data.existingId;
  if (data.mode === 'new') return !!data.newData;
  return false;
}, 'Fornecedor deve ser selecionado ou criado');

export const financialDataSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  due_date: z.date({
    required_error: 'Data de vencimento é obrigatória',
  }),
  payment_date: z.date().optional().nullable(),
  payment_method: z.string().optional(),
  status: z.enum(['pending', 'paid']),
  cost_center_id: z.string().uuid().optional(),
  chart_account_id: z.string().uuid().optional(),
  bank_account_id: z.string().uuid().optional(),
  installments: z.number().int().min(1).max(60),
  notes: z.string().optional(),
});

export const itemLinkActionSchema = z.object({
  type: z.enum(['link', 'create', 'none']),
  ingredientId: z.string().uuid().optional(),
  newIngredientData: z.object({
    name: z.string().min(3),
    code: z.string().optional(),
    ean: z.string().optional(),
    category_id: z.string().uuid().optional(),
    unit: z.string().min(1),
    min_stock: z.number().min(0),
    unit_cost: z.number().positive(),
  }).optional(),
}).refine(data => {
  if (data.type === 'link') return !!data.ingredientId;
  if (data.type === 'create') return !!data.newIngredientData;
  return true;
}, 'Ação de vinculação inválida');

export const completeInvoiceSchema = z.object({
  invoiceKey: invoiceDataSchema.shape.invoiceKey,
  invoiceNumber: invoiceDataSchema.shape.invoiceNumber,
  series: invoiceDataSchema.shape.series,
  emissionDate: invoiceDataSchema.shape.emissionDate,
  entryDate: invoiceDataSchema.shape.entryDate,
  operationType: invoiceDataSchema.shape.operationType,
  totals: invoiceDataSchema.shape.totals,
  supplier: supplierDataSchema,
  financial: financialDataSchema,
  items: z.array(z.any()).min(1, 'Nota deve ter pelo menos um item'),
  notes: z.string().optional(),
});

export type InvoiceDataFormValues = z.infer<typeof invoiceDataSchema>;
export type SupplierDataFormValues = z.infer<typeof supplierDataSchema>;
export type FinancialDataFormValues = z.infer<typeof financialDataSchema>;
export type CompleteInvoiceFormValues = z.infer<typeof completeInvoiceSchema>;
