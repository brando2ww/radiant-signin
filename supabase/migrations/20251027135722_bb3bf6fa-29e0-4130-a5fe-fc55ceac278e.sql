-- Criar tabela de leads do CRM
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Informações do Lead
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  avatar_url TEXT,
  
  -- Projeto/Negócio
  project_title TEXT NOT NULL,
  project_description TEXT,
  estimated_value NUMERIC,
  
  -- Pipeline
  stage TEXT NOT NULL DEFAULT 'incoming',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  
  -- Tags e Classificação
  tags TEXT[],
  source TEXT,
  
  -- Datas
  first_contact_date TIMESTAMPTZ,
  last_contact_date TIMESTAMPTZ,
  expected_close_date DATE,
  closed_date TIMESTAMPTZ,
  
  -- Conversão
  converted_to_transaction_id UUID REFERENCES public.transactions(id),
  win_probability INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de atividades do CRM
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  
  -- Atividade
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Agendamento
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de notas do CRM
CREATE TABLE public.crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX idx_crm_leads_stage ON public.crm_leads(stage);
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_activities_lead_id ON public.crm_activities(lead_id);
CREATE INDEX idx_crm_activities_scheduled_at ON public.crm_activities(scheduled_at);
CREATE INDEX idx_crm_notes_lead_id ON public.crm_notes(lead_id);

-- Habilitar RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para crm_leads
CREATE POLICY "Usuários podem ver seus próprios leads"
ON public.crm_leads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios leads"
ON public.crm_leads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios leads"
ON public.crm_leads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios leads"
ON public.crm_leads FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para crm_activities
CREATE POLICY "Usuários podem ver suas próprias atividades"
ON public.crm_activities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias atividades"
ON public.crm_activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias atividades"
ON public.crm_activities FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias atividades"
ON public.crm_activities FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para crm_notes
CREATE POLICY "Usuários podem ver suas próprias notas"
ON public.crm_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias notas"
ON public.crm_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notas"
ON public.crm_notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias notas"
ON public.crm_notes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_crm_activities_updated_at
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_crm_notes_updated_at
  BEFORE UPDATE ON public.crm_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();