-- Criar tabela de configurações do estabelecimento
CREATE TABLE public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  
  -- Informações do estabelecimento
  business_name text NOT NULL,
  business_slogan text,
  business_description text,
  
  -- Identidade visual
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#8b5cf6',
  
  -- Mensagens personalizadas
  welcome_message text DEFAULT 'Olá! Queremos ouvir você 😊',
  thank_you_message text DEFAULT 'Obrigado! Esperamos vê-lo novamente em breve!',
  
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem criar suas configurações
CREATE POLICY "Usuários podem criar suas configurações" 
ON public.business_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem ver suas próprias configurações
CREATE POLICY "Usuários podem ver suas configurações" 
ON public.business_settings FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Público pode ver configurações de estabelecimentos
CREATE POLICY "Público pode ver configurações de estabelecimentos" 
ON public.business_settings FOR SELECT 
USING (true);

-- Política: Usuários podem atualizar suas configurações
CREATE POLICY "Usuários podem atualizar suas configurações" 
ON public.business_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER handle_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Criar bucket para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuários podem fazer upload de logos próprios
CREATE POLICY "Usuários podem fazer upload de logos próprios"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários podem atualizar seus próprios logos
CREATE POLICY "Usuários podem atualizar logos próprios"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Usuários podem deletar seus próprios logos
CREATE POLICY "Usuários podem deletar logos próprios"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Público pode visualizar logos
CREATE POLICY "Público pode visualizar logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');