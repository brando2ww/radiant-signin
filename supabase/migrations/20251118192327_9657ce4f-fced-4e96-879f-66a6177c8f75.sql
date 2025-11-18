-- Criar tabela de contas bancárias
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT,
  agency TEXT,
  account_number TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'investment')),
  initial_balance NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas contas bancárias"
  ON public.bank_accounts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER handle_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar bank_account_id às transactions
ALTER TABLE public.transactions
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);

-- Adicionar bank_account_id às bills
ALTER TABLE public.bills
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);

-- Adicionar bank_account_id às credit_card_transactions (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'credit_card_transactions') THEN
    ALTER TABLE public.credit_card_transactions
    ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);
  END IF;
END $$;

-- Criar tabela para rastrear todas as movimentações
CREATE TABLE public.account_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit', 'transfer')) NOT NULL,
  description TEXT,
  reference_type TEXT CHECK (reference_type IN ('transaction', 'bill', 'transfer', 'manual')),
  reference_id UUID,
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para account_movements
ALTER TABLE public.account_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas movimentações"
  ON public.account_movements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index para performance
CREATE INDEX idx_account_movements_bank_account ON public.account_movements(bank_account_id);
CREATE INDEX idx_account_movements_created_at ON public.account_movements(created_at DESC);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_is_active ON public.bank_accounts(is_active) WHERE is_active = true;