
-- Tabela de campanhas de avaliação
CREATE TABLE public.evaluation_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de perguntas da campanha
CREATE TABLE public.evaluation_campaign_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  order_position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Adicionar campaign_id em customer_evaluations
ALTER TABLE public.customer_evaluations
  ADD COLUMN campaign_id uuid REFERENCES public.evaluation_campaigns(id) ON DELETE SET NULL;

-- Adicionar comment em evaluation_answers
ALTER TABLE public.evaluation_answers
  ADD COLUMN comment text;

-- RLS para evaluation_campaigns
ALTER TABLE public.evaluation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns"
  ON public.evaluation_campaigns
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Leitura pública de campanhas ativas (para a página pública)
CREATE POLICY "Public can read active campaigns"
  ON public.evaluation_campaigns
  FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS para evaluation_campaign_questions
ALTER TABLE public.evaluation_campaign_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaign questions"
  ON public.evaluation_campaign_questions
  FOR ALL
  TO authenticated
  USING (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()))
  WITH CHECK (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()));

-- Leitura pública de perguntas ativas
CREATE POLICY "Public can read active campaign questions"
  ON public.evaluation_campaign_questions
  FOR SELECT
  TO anon
  USING (is_active = true AND campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE is_active = true));

-- Trigger updated_at
CREATE TRIGGER handle_evaluation_campaigns_updated_at
  BEFORE UPDATE ON public.evaluation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_evaluation_campaign_questions_updated_at
  BEFORE UPDATE ON public.evaluation_campaign_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
