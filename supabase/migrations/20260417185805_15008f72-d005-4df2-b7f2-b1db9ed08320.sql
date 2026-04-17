-- 1. IP/porta nos centros de produção
ALTER TABLE public.pdv_production_centers
  ADD COLUMN IF NOT EXISTS printer_ip TEXT,
  ADD COLUMN IF NOT EXISTS printer_port INT DEFAULT 9100;

-- 2. production_center_id nos itens (snapshot histórico)
ALTER TABLE public.pdv_order_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES public.pdv_production_centers(id);

ALTER TABLE public.pdv_comanda_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES public.pdv_production_centers(id);

ALTER TABLE public.delivery_order_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES public.pdv_production_centers(id);

CREATE INDEX IF NOT EXISTS idx_pdv_order_items_production_center
  ON public.pdv_order_items(production_center_id) WHERE production_center_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pdv_comanda_items_production_center
  ON public.pdv_comanda_items(production_center_id) WHERE production_center_id IS NOT NULL;

-- 3. Realtime
ALTER TABLE public.pdv_order_items REPLICA IDENTITY FULL;
ALTER TABLE public.pdv_comanda_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pdv_order_items'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pdv_order_items';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'pdv_comanda_items'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pdv_comanda_items';
  END IF;
END $$;

-- 4. Views para o Print Bridge
CREATE OR REPLACE VIEW public.vw_print_bridge_order_items AS
SELECT
  oi.id,
  oi.order_id,
  oi.production_center_id,
  oi.product_name,
  oi.quantity,
  oi.notes,
  oi.modifiers,
  oi.kitchen_status,
  oi.sent_to_kitchen_at,
  pc.name        AS center_name,
  pc.printer_ip,
  pc.printer_port,
  o.order_number,
  o.table_id,
  t.table_number AS table_number,
  o.customer_name,
  o.source,
  o.user_id      AS tenant_user_id
FROM public.pdv_order_items oi
JOIN public.pdv_orders o ON o.id = oi.order_id
LEFT JOIN public.pdv_production_centers pc ON pc.id = oi.production_center_id
LEFT JOIN public.pdv_tables t ON t.id = o.table_id;

CREATE OR REPLACE VIEW public.vw_print_bridge_comanda_items AS
SELECT
  ci.id,
  ci.comanda_id,
  ci.production_center_id,
  ci.product_name,
  ci.quantity,
  ci.notes,
  ci.modifiers,
  ci.kitchen_status,
  ci.sent_to_kitchen_at,
  pc.name        AS center_name,
  pc.printer_ip,
  pc.printer_port,
  c.comanda_number,
  c.customer_name,
  c.user_id      AS tenant_user_id
FROM public.pdv_comanda_items ci
JOIN public.pdv_comandas c ON c.id = ci.comanda_id
LEFT JOIN public.pdv_production_centers pc ON pc.id = ci.production_center_id;