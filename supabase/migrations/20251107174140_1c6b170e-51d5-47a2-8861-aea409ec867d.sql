-- Create invoices table
CREATE TABLE public.pdv_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_key TEXT NOT NULL UNIQUE,
  series TEXT,
  emission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE SET NULL,
  supplier_cnpj TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  total_products NUMERIC NOT NULL DEFAULT 0,
  total_tax NUMERIC NOT NULL DEFAULT 0,
  total_invoice NUMERIC NOT NULL DEFAULT 0,
  freight_value NUMERIC DEFAULT 0,
  insurance_value NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  discount_value NUMERIC DEFAULT 0,
  operation_type TEXT NOT NULL, -- entrada/saida
  invoice_type TEXT NOT NULL, -- compra/venda/devolucao/transferencia
  xml_url TEXT,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending/reviewed/imported/error
  financial_transaction_id UUID REFERENCES public.pdv_financial_transactions(id) ON DELETE SET NULL,
  notes TEXT,
  import_errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.pdv_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.pdv_invoices(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  product_code TEXT,
  product_ean TEXT,
  product_name TEXT NOT NULL,
  ncm TEXT,
  cfop TEXT,
  unit TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_value NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  discount_value NUMERIC DEFAULT 0,
  freight_value NUMERIC DEFAULT 0,
  insurance_value NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  icms_value NUMERIC DEFAULT 0,
  ipi_value NUMERIC DEFAULT 0,
  pis_value NUMERIC DEFAULT 0,
  cofins_value NUMERIC DEFAULT 0,
  ingredient_id UUID REFERENCES public.pdv_ingredients(id) ON DELETE SET NULL,
  match_status TEXT NOT NULL DEFAULT 'pending', -- pending/matched/new/ignored
  suggested_ingredient_id UUID REFERENCES public.pdv_ingredients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdv_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdv_invoices
CREATE POLICY "Usuários podem gerenciar suas próprias notas fiscais"
ON public.pdv_invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pdv_invoice_items
CREATE POLICY "Usuários podem gerenciar itens de suas notas fiscais"
ON public.pdv_invoice_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.pdv_invoices
    WHERE pdv_invoices.id = pdv_invoice_items.invoice_id
    AND pdv_invoices.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_pdv_invoices_user_id ON public.pdv_invoices(user_id);
CREATE INDEX idx_pdv_invoices_supplier_id ON public.pdv_invoices(supplier_id);
CREATE INDEX idx_pdv_invoices_status ON public.pdv_invoices(status);
CREATE INDEX idx_pdv_invoices_emission_date ON public.pdv_invoices(emission_date);
CREATE INDEX idx_pdv_invoice_items_invoice_id ON public.pdv_invoice_items(invoice_id);
CREATE INDEX idx_pdv_invoice_items_ingredient_id ON public.pdv_invoice_items(ingredient_id);

-- Create trigger for updated_at
CREATE TRIGGER update_pdv_invoices_updated_at
BEFORE UPDATE ON public.pdv_invoices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();