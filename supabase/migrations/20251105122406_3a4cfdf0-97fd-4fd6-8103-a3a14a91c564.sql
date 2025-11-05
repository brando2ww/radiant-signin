-- Tabela de fila de espera
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  company_name TEXT,
  monthly_revenue TEXT,
  main_challenge TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  position INTEGER,
  status TEXT DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_phone ON public.waitlist(phone);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_position ON public.waitlist(position);
CREATE INDEX idx_waitlist_referral_code ON public.waitlist(referral_code);

-- Trigger para auto-incrementar posição
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL THEN
    NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM public.waitlist);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_waitlist_position_trigger
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_waitlist_position();

-- Trigger para gerar código de referral único
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(random()::text || NEW.email) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Trigger para updated_at
CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy para inserção pública (sem autenticação)
CREATE POLICY "Qualquer pessoa pode se inscrever na fila"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy para visualizar própria inscrição por email
CREATE POLICY "Pessoas podem ver sua própria inscrição"
  ON public.waitlist
  FOR SELECT
  USING (true);

-- Policy para usuários autenticados verem todas as inscrições (admin)
CREATE POLICY "Usuários autenticados podem ver todas as inscrições"
  ON public.waitlist
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy para usuários autenticados atualizarem inscrições
CREATE POLICY "Usuários autenticados podem atualizar inscrições"
  ON public.waitlist
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);