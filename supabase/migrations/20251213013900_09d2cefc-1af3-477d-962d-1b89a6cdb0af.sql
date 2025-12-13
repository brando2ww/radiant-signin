-- Tabela para manter contexto da sessão WhatsApp
CREATE TABLE public.whatsapp_session_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  last_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  pending_transaction JSONB,
  conversation_state TEXT DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(phone_number)
);

-- Enable RLS
ALTER TABLE public.whatsapp_session_context ENABLE ROW LEVEL SECURITY;

-- Policy para a edge function acessar via service role
CREATE POLICY "Service role full access" ON public.whatsapp_session_context
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_session_context_updated_at
  BEFORE UPDATE ON public.whatsapp_session_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();