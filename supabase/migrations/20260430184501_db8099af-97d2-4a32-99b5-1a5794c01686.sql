
ALTER TABLE public.pdv_nfce_emissions
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_protocol text,
  ADD COLUMN IF NOT EXISTS last_status_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS parent_emission_id uuid REFERENCES public.pdv_nfce_emissions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pdv_nfce_emissions_user_data
  ON public.pdv_nfce_emissions (user_id, data_emissao DESC);

CREATE INDEX IF NOT EXISTS idx_pdv_nfce_emissions_user_status
  ON public.pdv_nfce_emissions (user_id, status);

-- Garantir RLS habilitado
ALTER TABLE public.pdv_nfce_emissions ENABLE ROW LEVEL SECURITY;

-- Recriar políticas (idempotente)
DROP POLICY IF EXISTS "Owners and members can view nfce" ON public.pdv_nfce_emissions;
CREATE POLICY "Owners and members can view nfce"
  ON public.pdv_nfce_emissions
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_establishment_member(user_id)
  );

DROP POLICY IF EXISTS "Owners and members can update nfce" ON public.pdv_nfce_emissions;
CREATE POLICY "Owners and members can update nfce"
  ON public.pdv_nfce_emissions
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_establishment_member(user_id)
  );
