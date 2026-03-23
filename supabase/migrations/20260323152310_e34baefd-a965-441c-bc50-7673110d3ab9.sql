
-- Tabela de templates de tarefas recorrentes
CREATE TABLE public.operational_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  shift TEXT NOT NULL DEFAULT 'abertura',
  assigned_to TEXT,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operational_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select templates" ON public.operational_task_templates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owner can insert templates" ON public.operational_task_templates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can update templates" ON public.operational_task_templates FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can delete templates" ON public.operational_task_templates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Tabela de instâncias diárias
CREATE TABLE public.operational_task_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.operational_task_templates(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  shift TEXT NOT NULL DEFAULT 'abertura',
  assigned_to TEXT,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operational_task_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view task instances" ON public.operational_task_instances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update task instances" ON public.operational_task_instances FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Owner can insert instances" ON public.operational_task_instances FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anon can insert instances" ON public.operational_task_instances FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Owner can delete instances" ON public.operational_task_instances FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Tabela de configurações
CREATE TABLE public.operational_task_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  shifts JSONB NOT NULL DEFAULT '[{"name":"Abertura","start":"06:00","end":"11:00"},{"name":"Tarde","start":"11:00","end":"17:00"},{"name":"Fechamento","start":"17:00","end":"23:00"}]'::jsonb,
  auto_generate BOOLEAN NOT NULL DEFAULT true,
  qr_code_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operational_task_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select settings" ON public.operational_task_settings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owner can insert settings" ON public.operational_task_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can update settings" ON public.operational_task_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner can delete settings" ON public.operational_task_settings FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anon can view settings" ON public.operational_task_settings FOR SELECT TO anon USING (true);

CREATE INDEX idx_task_instances_user_date ON public.operational_task_instances(user_id, task_date);
CREATE INDEX idx_task_templates_user ON public.operational_task_templates(user_id, is_active);

CREATE TRIGGER handle_updated_at_task_templates BEFORE UPDATE ON public.operational_task_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at_task_settings BEFORE UPDATE ON public.operational_task_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
