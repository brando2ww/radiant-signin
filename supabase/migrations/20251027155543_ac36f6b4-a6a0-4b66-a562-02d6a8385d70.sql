-- Criar tabela de perguntas de avaliação
CREATE TABLE public.evaluation_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de avaliações dos clientes
CREATE TABLE public.customer_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_birth_date DATE NOT NULL,
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  evaluation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de respostas às perguntas
CREATE TABLE public.evaluation_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.customer_evaluations(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.evaluation_questions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo nps_enabled na tabela user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS nps_enabled BOOLEAN DEFAULT true;

-- Criar índices para performance
CREATE INDEX idx_evaluation_questions_user_id ON public.evaluation_questions(user_id);
CREATE INDEX idx_customer_evaluations_user_id ON public.customer_evaluations(user_id);
CREATE INDEX idx_evaluation_answers_evaluation_id ON public.evaluation_answers(evaluation_id);
CREATE INDEX idx_evaluation_answers_question_id ON public.evaluation_answers(question_id);

-- Habilitar RLS
ALTER TABLE public.evaluation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_answers ENABLE ROW LEVEL SECURITY;

-- Políticas para evaluation_questions (apenas dono)
CREATE POLICY "Usuários podem ver suas próprias perguntas"
  ON public.evaluation_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias perguntas"
  ON public.evaluation_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias perguntas"
  ON public.evaluation_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias perguntas"
  ON public.evaluation_questions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para customer_evaluations (dono vê, público insere)
CREATE POLICY "Usuários podem ver suas próprias avaliações"
  ON public.customer_evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Qualquer pessoa pode criar avaliações"
  ON public.customer_evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias avaliações"
  ON public.customer_evaluations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias avaliações"
  ON public.customer_evaluations FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para evaluation_answers (dono vê via JOIN, público insere)
CREATE POLICY "Usuários podem ver respostas de suas avaliações"
  ON public.evaluation_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_evaluations
      WHERE customer_evaluations.id = evaluation_answers.evaluation_id
      AND customer_evaluations.user_id = auth.uid()
    )
  );

CREATE POLICY "Qualquer pessoa pode criar respostas"
  ON public.evaluation_answers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem deletar respostas de suas avaliações"
  ON public.evaluation_answers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_evaluations
      WHERE customer_evaluations.id = evaluation_answers.evaluation_id
      AND customer_evaluations.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at em evaluation_questions
CREATE TRIGGER update_evaluation_questions_updated_at
  BEFORE UPDATE ON public.evaluation_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();