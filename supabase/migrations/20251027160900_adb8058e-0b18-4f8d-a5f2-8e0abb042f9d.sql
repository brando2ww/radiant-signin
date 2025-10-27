-- Adiciona política pública para leitura de perguntas ativas
CREATE POLICY "Público pode ver perguntas ativas"
  ON public.evaluation_questions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Adiciona política pública para leitura de configurações NPS
CREATE POLICY "Público pode ver configurações NPS"
  ON public.user_settings FOR SELECT
  TO anon, authenticated
  USING (true);