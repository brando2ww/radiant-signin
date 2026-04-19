-- Cria a tabela de fila de impressão
CREATE TABLE public.pdv_print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_user_id uuid NOT NULL,
  source_kind text NOT NULL CHECK (source_kind IN ('comanda', 'order')),
  source_item_id uuid NOT NULL,
  center_id uuid,
  center_name text,
  printer_ip text,
  printer_port integer DEFAULT 9100,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'printed', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  printed_at timestamptz
);

-- Índices para performance
CREATE INDEX idx_print_jobs_status_created ON public.pdv_print_jobs (status, created_at);
CREATE INDEX idx_print_jobs_tenant ON public.pdv_print_jobs (tenant_user_id);

-- Habilita RLS
ALTER TABLE public.pdv_print_jobs ENABLE ROW LEVEL SECURITY;

-- INSERT: dono ou membro do estabelecimento
CREATE POLICY "Tenant members can insert print jobs"
  ON public.pdv_print_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_user_id = auth.uid()
    OR public.is_establishment_member(tenant_user_id)
  );

-- SELECT: anon (bridge) e authenticated (dono/membros e bridge)
CREATE POLICY "Anyone can read print jobs"
  ON public.pdv_print_jobs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- UPDATE: anon (bridge) e authenticated marcam como printed/failed
CREATE POLICY "Anyone can update print jobs"
  ON public.pdv_print_jobs
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Habilita Realtime
ALTER TABLE public.pdv_print_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pdv_print_jobs;

-- Garante grants para anon e authenticated
GRANT SELECT, INSERT, UPDATE ON public.pdv_print_jobs TO anon, authenticated;