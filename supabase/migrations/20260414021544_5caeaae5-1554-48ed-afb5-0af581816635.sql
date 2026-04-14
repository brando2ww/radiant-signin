
-- ===========================================
-- ENUMS
-- ===========================================
DO $$ BEGIN
  CREATE TYPE public.checklist_sector AS ENUM ('cozinha','salao','caixa','bar','estoque','gerencia');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.checklist_item_type AS ENUM ('checkbox','number','text','photo','temperature','stars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.checklist_execution_status AS ENUM ('pendente','em_andamento','concluido','atrasado','nao_iniciado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.checklist_alert_type AS ENUM ('prazo_expirado','temperatura_fora','item_critico');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.operator_access_level AS ENUM ('operador','lider','gestor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.evidence_review_status AS ENUM ('pendente','aprovado','reprovado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.expiry_status AS ENUM ('valido','proximo_vencimento','vencido','descartado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- TABLES
-- ===========================================

-- 1. Operators (staff with PIN access)
CREATE TABLE public.checklist_operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- establishment owner
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Colaborador',
  sector public.checklist_sector NOT NULL DEFAULT 'cozinha',
  pin TEXT NOT NULL, -- 4-digit PIN
  access_level public.operator_access_level NOT NULL DEFAULT 'operador',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Checklists (templates/definitions)
CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  sector public.checklist_sector NOT NULL DEFAULT 'cozinha',
  description TEXT,
  is_template BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Checklist items
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type public.checklist_item_type NOT NULL DEFAULT 'checkbox',
  is_critical BOOLEAN NOT NULL DEFAULT false,
  is_required BOOLEAN NOT NULL DEFAULT true,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  min_value NUMERIC,
  max_value NUMERIC,
  training_instruction TEXT,
  training_video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Schedules
CREATE TABLE public.checklist_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  days_of_week JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  shift TEXT NOT NULL DEFAULT 'manha',
  start_time TIME NOT NULL DEFAULT '08:00',
  max_duration_minutes INT NOT NULL DEFAULT 60,
  assigned_operator_id UUID REFERENCES public.checklist_operators(id) ON DELETE SET NULL,
  assigned_sector public.checklist_sector,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Executions
CREATE TABLE public.checklist_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.checklist_schedules(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES public.checklist_operators(id) ON DELETE SET NULL,
  status public.checklist_execution_status NOT NULL DEFAULT 'pendente',
  execution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Execution items
CREATE TABLE public.checklist_execution_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  value JSONB,
  photo_url TEXT,
  is_compliant BOOLEAN,
  completed_at TIMESTAMPTZ
);

-- 7. Alerts
CREATE TABLE public.checklist_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  execution_id UUID REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.checklist_items(id) ON DELETE SET NULL,
  alert_type public.checklist_alert_type NOT NULL,
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES public.checklist_operators(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Operator scores
CREATE TABLE public.operator_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operator_id UUID NOT NULL REFERENCES public.checklist_operators(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_executions INT NOT NULL DEFAULT 0,
  on_time_count INT NOT NULL DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Evidence reviews
CREATE TABLE public.checklist_evidence_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  execution_item_id UUID NOT NULL REFERENCES public.checklist_execution_items(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.checklist_operators(id) ON DELETE SET NULL,
  status public.evidence_review_status NOT NULL DEFAULT 'pendente',
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Product expiry tracking
CREATE TABLE public.product_expiry_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  batch_id TEXT,
  expiry_date DATE NOT NULL,
  registered_by UUID REFERENCES public.checklist_operators(id) ON DELETE SET NULL,
  status public.expiry_status NOT NULL DEFAULT 'valido',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Access logs
CREATE TABLE public.checklist_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operator_id UUID NOT NULL REFERENCES public.checklist_operators(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_checklist_items_checklist ON public.checklist_items(checklist_id);
CREATE INDEX idx_checklist_schedules_checklist ON public.checklist_schedules(checklist_id);
CREATE INDEX idx_checklist_executions_date ON public.checklist_executions(user_id, execution_date);
CREATE INDEX idx_checklist_executions_operator ON public.checklist_executions(operator_id);
CREATE INDEX idx_checklist_execution_items_exec ON public.checklist_execution_items(execution_id);
CREATE INDEX idx_checklist_alerts_user ON public.checklist_alerts(user_id, is_acknowledged);
CREATE INDEX idx_operator_scores_operator ON public.operator_scores(operator_id, period_start);
CREATE INDEX idx_product_expiry_date ON public.product_expiry_tracking(user_id, expiry_date);
CREATE INDEX idx_checklist_access_logs_operator ON public.checklist_access_logs(operator_id);

-- ===========================================
-- RLS
-- ===========================================
ALTER TABLE public.checklist_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_execution_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_evidence_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_expiry_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_access_logs ENABLE ROW LEVEL SECURITY;

-- Policies: owner OR establishment member
CREATE POLICY "checklist_operators_access" ON public.checklist_operators FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklists_access" ON public.checklists FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklist_items_access" ON public.checklist_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND (auth.uid() = c.user_id OR public.is_establishment_member(c.user_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND (auth.uid() = c.user_id OR public.is_establishment_member(c.user_id))));

CREATE POLICY "checklist_schedules_access" ON public.checklist_schedules FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklist_executions_access" ON public.checklist_executions FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklist_execution_items_access" ON public.checklist_execution_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklist_executions e WHERE e.id = execution_id AND (auth.uid() = e.user_id OR public.is_establishment_member(e.user_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklist_executions e WHERE e.id = execution_id AND (auth.uid() = e.user_id OR public.is_establishment_member(e.user_id))));

CREATE POLICY "checklist_alerts_access" ON public.checklist_alerts FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "operator_scores_access" ON public.operator_scores FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklist_evidence_reviews_access" ON public.checklist_evidence_reviews FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "product_expiry_access" ON public.product_expiry_tracking FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "checklist_access_logs_access" ON public.checklist_access_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

-- ===========================================
-- TRIGGERS (updated_at)
-- ===========================================
CREATE TRIGGER update_checklist_operators_updated_at BEFORE UPDATE ON public.checklist_operators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_schedules_updated_at BEFORE UPDATE ON public.checklist_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_expiry_updated_at BEFORE UPDATE ON public.product_expiry_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- STORAGE BUCKET
-- ===========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('checklist-evidence', 'checklist-evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "checklist_evidence_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'checklist-evidence');

CREATE POLICY "checklist_evidence_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'checklist-evidence');

CREATE POLICY "checklist_evidence_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'checklist-evidence');

CREATE POLICY "checklist_evidence_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'checklist-evidence');
