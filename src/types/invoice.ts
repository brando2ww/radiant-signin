import { ParsedInvoice, ParsedInvoiceItem } from "@/lib/invoice/xml-parser";

export interface EditableSupplierData {
  name: string;
  company_name?: string;
  cnpj?: string;
  state_registration?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface EditableFinancialData {
  description: string;
  amount: number;
  due_date: Date;
  payment_date?: Date | null;
  payment_method?: string;
  status: 'pending' | 'paid';
  cost_center_id?: string;
  chart_account_id?: string;
  bank_account_id?: string;
  installments: number;
  notes?: string;
}

export type LinkActionType = 'link' | 'create' | 'none';

export interface NewIngredientData {
  name: string;
  code?: string;
  ean?: string;
  category_id?: string;
  unit: string;
  min_stock: number;
  unit_cost: number;
}

export interface EditableInvoiceItem extends ParsedInvoiceItem {
  linkAction: {
    type: LinkActionType;
    ingredientId?: string;
    newIngredientData?: NewIngredientData;
  };
}

export interface EditableInvoiceData {
  // Dados da nota
  invoiceKey: string;
  invoiceNumber: string;
  series: string;
  emissionDate: Date;
  entryDate: Date;
  operationType: 'entrada' | 'saida';
  
  // Totais editáveis
  totals: {
    products: number;
    tax: number;
    invoice: number;
    freight: number;
    insurance: number;
    otherExpenses: number;
    discount: number;
  };
  
  // Fornecedor
  supplier: {
    mode: 'existing' | 'new';
    existingId?: string;
    newData?: EditableSupplierData;
  };
  
  // Financeiro
  financial: EditableFinancialData;
  
  // Itens
  items: EditableInvoiceItem[];
  
  // Observações gerais
  notes?: string;
}

export function parseInvoiceToEditable(invoice: ParsedInvoice): EditableInvoiceData {
  return {
    invoiceKey: invoice.invoiceKey,
    invoiceNumber: invoice.invoiceNumber,
    series: invoice.series,
    emissionDate: invoice.emissionDate,
    entryDate: new Date(),
    operationType: invoice.operationType,
    totals: {
      products: invoice.totals.products,
      tax: invoice.totals.tax,
      invoice: invoice.totals.invoice,
      freight: invoice.totals.freight || 0,
      insurance: invoice.totals.insurance || 0,
      otherExpenses: invoice.totals.otherExpenses || 0,
      discount: invoice.totals.discount || 0,
    },
    supplier: {
      mode: 'new',
      newData: {
        name: invoice.supplier.name,
        company_name: invoice.supplier.companyName,
        cnpj: invoice.supplier.cnpj,
        state_registration: invoice.supplier.stateRegistration,
        phone: invoice.supplier.phone,
        email: invoice.supplier.email,
        address: invoice.supplier.address,
        city: invoice.supplier.city,
        state: invoice.supplier.state,
        zip_code: invoice.supplier.zipCode,
      },
    },
    financial: {
      description: `NF-e ${invoice.invoiceNumber} - ${invoice.supplier.name}`,
      amount: invoice.totals.invoice,
      due_date: invoice.emissionDate,
      status: 'pending',
      installments: 1,
    },
    items: invoice.items.map(item => ({
      ...item,
      linkAction: {
        type: 'none' as LinkActionType,
      },
    })),
  };
}
