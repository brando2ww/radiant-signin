-- Add parent_item_id and is_composite_child to pdv_comanda_items
ALTER TABLE public.pdv_comanda_items
  ADD COLUMN IF NOT EXISTS parent_item_id uuid REFERENCES public.pdv_comanda_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_composite_child boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_pdv_comanda_items_parent ON public.pdv_comanda_items(parent_item_id);

-- Add parent_item_id and is_composite_child to pdv_order_items
ALTER TABLE public.pdv_order_items
  ADD COLUMN IF NOT EXISTS parent_item_id uuid REFERENCES public.pdv_order_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_composite_child boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_pdv_order_items_parent ON public.pdv_order_items(parent_item_id);

-- Recreate Print Bridge views to expose parent context
DROP VIEW IF EXISTS public.vw_print_bridge_comanda_items;
CREATE VIEW public.vw_print_bridge_comanda_items AS
SELECT ci.id,
    ci.comanda_id,
    ci.production_center_id,
    ci.product_name,
    ci.quantity,
    ci.notes,
    ci.modifiers,
    ci.kitchen_status,
    ci.sent_to_kitchen_at,
    ci.parent_item_id,
    ci.is_composite_child,
    parent.product_name AS parent_product_name,
    pc.name AS center_name,
    pc.printer_ip,
    pc.printer_port,
    c.comanda_number,
    c.customer_name,
    c.user_id AS tenant_user_id
FROM pdv_comanda_items ci
JOIN pdv_comandas c ON c.id = ci.comanda_id
LEFT JOIN pdv_production_centers pc ON pc.id = ci.production_center_id
LEFT JOIN pdv_comanda_items parent ON parent.id = ci.parent_item_id;

DROP VIEW IF EXISTS public.vw_print_bridge_order_items;
CREATE VIEW public.vw_print_bridge_order_items AS
SELECT oi.id,
    oi.order_id,
    oi.production_center_id,
    oi.product_name,
    oi.quantity,
    oi.notes,
    oi.modifiers,
    oi.kitchen_status,
    oi.sent_to_kitchen_at,
    oi.parent_item_id,
    oi.is_composite_child,
    parent.product_name AS parent_product_name,
    pc.name AS center_name,
    pc.printer_ip,
    pc.printer_port,
    o.order_number,
    o.table_id,
    t.table_number,
    o.customer_name,
    o.source,
    o.user_id AS tenant_user_id
FROM pdv_order_items oi
JOIN pdv_orders o ON o.id = oi.order_id
LEFT JOIN pdv_production_centers pc ON pc.id = oi.production_center_id
LEFT JOIN pdv_tables t ON t.id = o.table_id
LEFT JOIN pdv_order_items parent ON parent.id = oi.parent_item_id;