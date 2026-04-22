-- Add CSC fields for NFC-e emission
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS nfe_csc_id text,
  ADD COLUMN IF NOT EXISTS nfe_csc_token text;

-- Create NFC-e emissions table
CREATE TABLE IF NOT EXISTS public.pdv_nfce_emissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid,
  comanda_id uuid,
  table_id uuid,
  cashier_session_id uuid,
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','autorizada','rejeitada','cancelada','erro')),
  ambiente text NOT NULL DEFAULT 'homologacao'
    CHECK (ambiente IN ('homologacao','producao')),
  serie text,
  numero integer,
  chave_acesso text UNIQUE,
  protocolo_autorizacao text,
  data_emissao timestamptz NOT NULL DEFAULT now(),
  data_autorizacao timestamptz,
  valor_total numeric(12,2) NOT NULL DEFAULT 0,
  valor_desconto numeric(12,2) NOT NULL DEFAULT 0,
  valor_servico numeric(12,2) NOT NULL DEFAULT 0,
  forma_pagamento text,
  parcelas integer DEFAULT 1,
  customer_cpf text,
  customer_email text,
  customer_name text,
  nuvem_fiscal_id text,
  xml_url text,
  danfe_pdf_url text,
  danfe_html_url text,
  rejection_reason text,
  error_payload jsonb,
  items_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdv_nfce_user ON public.pdv_nfce_emissions(user_id);
CREATE INDEX IF NOT EXISTS idx_pdv_nfce_status ON public.pdv_nfce_emissions(status);
CREATE INDEX IF NOT EXISTS idx_pdv_nfce_session ON public.pdv_nfce_emissions(cashier_session_id);
CREATE INDEX IF NOT EXISTS idx_pdv_nfce_chave ON public.pdv_nfce_emissions(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_pdv_nfce_data ON public.pdv_nfce_emissions(data_emissao DESC);

-- Enable RLS
ALTER TABLE public.pdv_nfce_emissions ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "Owners manage their NFC-e emissions"
ON public.pdv_nfce_emissions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Staff (establishment members) can view and insert NFC-e for their establishment owner
CREATE POLICY "Staff view establishment NFC-e"
ON public.pdv_nfce_emissions
FOR SELECT
USING (public.is_establishment_member(user_id));

CREATE POLICY "Staff insert NFC-e for establishment"
ON public.pdv_nfce_emissions
FOR INSERT
WITH CHECK (public.is_establishment_member(user_id));

CREATE POLICY "Staff update establishment NFC-e"
ON public.pdv_nfce_emissions
FOR UPDATE
USING (public.is_establishment_member(user_id))
WITH CHECK (public.is_establishment_member(user_id));

-- Trigger updated_at
CREATE TRIGGER trg_pdv_nfce_emissions_updated_at
BEFORE UPDATE ON public.pdv_nfce_emissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();