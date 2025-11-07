-- Criar tabela de plano de contas (hierárquico)
CREATE TABLE IF NOT EXISTS public.pdv_chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.pdv_chart_of_accounts(id) ON DELETE SET NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('revenue', 'expense', 'cost', 'asset', 'liability')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Habilitar RLS
ALTER TABLE public.pdv_chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Policies para plano de contas
CREATE POLICY "Usuários podem gerenciar seu próprio plano de contas"
  ON public.pdv_chart_of_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Criar tabela de contas bancárias
CREATE TABLE IF NOT EXISTS public.pdv_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  initial_balance NUMERIC(12, 2) DEFAULT 0,
  current_balance NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdv_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policies para contas bancárias
CREATE POLICY "Usuários podem gerenciar suas próprias contas bancárias"
  ON public.pdv_bank_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.pdv_financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  chart_account_id UUID REFERENCES public.pdv_chart_of_accounts(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.pdv_cost_centers(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES public.pdv_bank_accounts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.pdv_customers(id) ON DELETE SET NULL,
  payment_method TEXT,
  document_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdv_financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies para transações financeiras
CREATE POLICY "Usuários podem gerenciar suas próprias transações"
  ON public.pdv_financial_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdv_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.pdv_chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdv_bank_accounts_updated_at
  BEFORE UPDATE ON public.pdv_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdv_financial_transactions_updated_at
  BEFORE UPDATE ON public.pdv_financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_pdv_chart_accounts_user ON public.pdv_chart_of_accounts(user_id);
CREATE INDEX idx_pdv_chart_accounts_parent ON public.pdv_chart_of_accounts(parent_id);
CREATE INDEX idx_pdv_bank_accounts_user ON public.pdv_bank_accounts(user_id);
CREATE INDEX idx_pdv_financial_transactions_user ON public.pdv_financial_transactions(user_id);
CREATE INDEX idx_pdv_financial_transactions_date ON public.pdv_financial_transactions(due_date);
CREATE INDEX idx_pdv_financial_transactions_status ON public.pdv_financial_transactions(status);