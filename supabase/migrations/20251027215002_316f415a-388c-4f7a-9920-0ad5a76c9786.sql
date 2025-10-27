-- Criar tabela de sessões de caixa
CREATE TABLE public.pdv_cashier_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cash DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_card DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_pix DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_withdrawals DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentações de caixa
CREATE TABLE public.pdv_cashier_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cashier_session_id UUID NOT NULL REFERENCES public.pdv_cashier_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'sangria', 'reforco', 'venda')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('dinheiro', 'cartao', 'pix')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_cashier_sessions_user_id ON public.pdv_cashier_sessions(user_id);
CREATE INDEX idx_cashier_sessions_closed_at ON public.pdv_cashier_sessions(closed_at);
CREATE INDEX idx_cashier_movements_session ON public.pdv_cashier_movements(cashier_session_id);

-- Habilitar RLS
ALTER TABLE public.pdv_cashier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_cashier_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pdv_cashier_sessions
CREATE POLICY "Users can view their own cashier sessions"
  ON public.pdv_cashier_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cashier sessions"
  ON public.pdv_cashier_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cashier sessions"
  ON public.pdv_cashier_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cashier sessions"
  ON public.pdv_cashier_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para pdv_cashier_movements
CREATE POLICY "Users can view movements from their sessions"
  ON public.pdv_cashier_movements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions
      WHERE id = cashier_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create movements in their sessions"
  ON public.pdv_cashier_movements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions
      WHERE id = cashier_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update movements in their sessions"
  ON public.pdv_cashier_movements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions
      WHERE id = cashier_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete movements from their sessions"
  ON public.pdv_cashier_movements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions
      WHERE id = cashier_session_id
      AND user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cashier_sessions_updated_at
  BEFORE UPDATE ON public.pdv_cashier_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();