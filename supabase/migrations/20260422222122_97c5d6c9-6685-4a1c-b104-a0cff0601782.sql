-- Substituir policies de pdv_cashier_sessions para permitir staff
DROP POLICY IF EXISTS "Users can view their own cashier sessions" ON public.pdv_cashier_sessions;
DROP POLICY IF EXISTS "Users can create their own cashier sessions" ON public.pdv_cashier_sessions;
DROP POLICY IF EXISTS "Users can update their own cashier sessions" ON public.pdv_cashier_sessions;
DROP POLICY IF EXISTS "Users can delete their own cashier sessions" ON public.pdv_cashier_sessions;

CREATE POLICY "Owner and staff can view cashier sessions"
  ON public.pdv_cashier_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "Owner can create cashier sessions"
  ON public.pdv_cashier_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner and staff can update cashier sessions"
  ON public.pdv_cashier_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "Owner can delete cashier sessions"
  ON public.pdv_cashier_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Substituir policies de pdv_cashier_movements para permitir staff
DROP POLICY IF EXISTS "Users can view movements from their sessions" ON public.pdv_cashier_movements;
DROP POLICY IF EXISTS "Users can create movements in their sessions" ON public.pdv_cashier_movements;
DROP POLICY IF EXISTS "Users can update movements in their sessions" ON public.pdv_cashier_movements;
DROP POLICY IF EXISTS "Users can delete movements from their sessions" ON public.pdv_cashier_movements;

CREATE POLICY "Owner and staff can view cashier movements"
  ON public.pdv_cashier_movements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions s
      WHERE s.id = cashier_session_id
        AND (s.user_id = auth.uid() OR public.is_establishment_member(s.user_id))
    )
  );

CREATE POLICY "Owner and staff can insert cashier movements"
  ON public.pdv_cashier_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions s
      WHERE s.id = cashier_session_id
        AND (s.user_id = auth.uid() OR public.is_establishment_member(s.user_id))
    )
  );

CREATE POLICY "Owner and staff can update cashier movements"
  ON public.pdv_cashier_movements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions s
      WHERE s.id = cashier_session_id
        AND (s.user_id = auth.uid() OR public.is_establishment_member(s.user_id))
    )
  );

CREATE POLICY "Owner can delete cashier movements"
  ON public.pdv_cashier_movements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_cashier_sessions s
      WHERE s.id = cashier_session_id
        AND s.user_id = auth.uid()
    )
  );