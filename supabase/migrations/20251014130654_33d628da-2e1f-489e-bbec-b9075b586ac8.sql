-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  location TEXT,
  tags TEXT[],
  related_transaction_id UUID,
  related_bill_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_start_time ON public.tasks(start_time);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Usuários podem ver suas próprias tarefas"
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias tarefas"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias tarefas"
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample tasks for testing
INSERT INTO public.tasks (user_id, title, description, start_time, end_time, category, color, priority, tags) 
SELECT 
  id,
  'Pagar conta de luz',
  'Vencimento da conta de energia',
  CURRENT_DATE + INTERVAL '2 days' + INTERVAL '10 hours',
  CURRENT_DATE + INTERVAL '2 days' + INTERVAL '10 hours 30 minutes',
  'payment',
  '#f97316',
  'high',
  ARRAY['urgente', 'casa']
FROM auth.users
WHERE email = 'eduardobrando1@gmail.com'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, start_time, end_time, category, color, priority, tags)
SELECT 
  id,
  'Reunião com contador',
  'Revisar relatórios fiscais do MEI',
  CURRENT_DATE + INTERVAL '3 days' + INTERVAL '14 hours',
  CURRENT_DATE + INTERVAL '3 days' + INTERVAL '15 hours 30 minutes',
  'meeting',
  '#3b82f6',
  'medium',
  ARRAY['MEI', 'impostos']
FROM auth.users
WHERE email = 'eduardobrando1@gmail.com'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, start_time, end_time, category, color, priority, tags)
SELECT 
  id,
  'Reconciliação bancária',
  'Conferir extratos do mês de outubro',
  CURRENT_DATE + INTERVAL '4 days' + INTERVAL '9 hours',
  CURRENT_DATE + INTERVAL '4 days' + INTERVAL '11 hours',
  'reconciliation',
  '#22c55e',
  'medium',
  ARRAY['banco', 'mensal']
FROM auth.users
WHERE email = 'eduardobrando1@gmail.com'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, start_time, end_time, category, color, priority, tags)
SELECT 
  id,
  'Revisar gastos do cartão',
  'Conferir fatura do cartão Nubank',
  CURRENT_DATE + INTERVAL '1 day' + INTERVAL '16 hours',
  CURRENT_DATE + INTERVAL '1 day' + INTERVAL '17 hours',
  'administrative',
  '#3b82f6',
  'low',
  ARRAY['cartão', 'revisão']
FROM auth.users
WHERE email = 'eduardobrando1@gmail.com'
LIMIT 1;

INSERT INTO public.tasks (user_id, title, description, start_time, end_time, category, color, priority, tags)
SELECT 
  id,
  'Planejamento financeiro',
  'Revisar metas do mês',
  CURRENT_DATE + INTERVAL '5 days' + INTERVAL '10 hours',
  CURRENT_DATE + INTERVAL '5 days' + INTERVAL '12 hours',
  'personal',
  '#a855f7',
  'medium',
  ARRAY['planejamento', 'metas']
FROM auth.users
WHERE email = 'eduardobrando1@gmail.com'
LIMIT 1;