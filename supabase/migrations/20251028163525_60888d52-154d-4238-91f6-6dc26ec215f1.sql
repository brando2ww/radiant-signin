-- Adicionar novos campos à tabela pdv_suppliers
ALTER TABLE public.pdv_suppliers
  ADD COLUMN company_name TEXT,
  ADD COLUMN cpf TEXT,
  ADD COLUMN state_registration TEXT,
  ADD COLUMN municipal_registration TEXT,
  ADD COLUMN whatsapp TEXT,
  ADD COLUMN neighborhood TEXT,
  ADD COLUMN address_complement TEXT,
  ADD COLUMN ibge_code TEXT,
  ADD COLUMN is_billing_address BOOLEAN DEFAULT false,
  ADD COLUMN commercial_notes TEXT,
  ADD COLUMN financial_notes TEXT,
  ADD COLUMN payment_terms TEXT,
  ADD COLUMN delivery_time INTEGER,
  ADD COLUMN delivery_time_unit TEXT DEFAULT 'days',
  ADD COLUMN credit_limit NUMERIC,
  ADD COLUMN preferred_payment_method TEXT,
  ADD COLUMN contacts JSONB DEFAULT '[]'::jsonb;

-- Adicionar índices para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_pdv_suppliers_cnpj ON public.pdv_suppliers(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pdv_suppliers_cpf ON public.pdv_suppliers(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pdv_suppliers_name ON public.pdv_suppliers(name);

-- Comentários para documentação
COMMENT ON COLUMN public.pdv_suppliers.company_name IS 'Razão Social do fornecedor';
COMMENT ON COLUMN public.pdv_suppliers.cpf IS 'CPF do fornecedor (para pessoa física)';
COMMENT ON COLUMN public.pdv_suppliers.state_registration IS 'Inscrição Estadual (IE)';
COMMENT ON COLUMN public.pdv_suppliers.municipal_registration IS 'Inscrição Municipal (IM)';
COMMENT ON COLUMN public.pdv_suppliers.ibge_code IS 'Código IBGE da cidade';
COMMENT ON COLUMN public.pdv_suppliers.is_billing_address IS 'Indica se é endereço de cobrança';
COMMENT ON COLUMN public.pdv_suppliers.contacts IS 'Lista de contatos adicionais em formato JSON';