-- Remove política existente de INSERT
DROP POLICY IF EXISTS "Qualquer pessoa pode criar avaliações" ON public.customer_evaluations;

-- Recria política com especificação explícita de roles para anon e authenticated
CREATE POLICY "Qualquer pessoa pode criar avaliações"
  ON public.customer_evaluations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Remove política existente de INSERT para respostas
DROP POLICY IF EXISTS "Qualquer pessoa pode criar respostas" ON public.evaluation_answers;

-- Recria política para respostas com especificação explícita de roles
CREATE POLICY "Qualquer pessoa pode criar respostas"
  ON public.evaluation_answers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);