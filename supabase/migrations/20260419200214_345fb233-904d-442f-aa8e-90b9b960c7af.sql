-- Recria as views de impressão sem security_invoker para que rodem como o owner (postgres),
-- bypassando o RLS das tabelas-base. Isso permite que o Print Bridge (anon key) leia os dados.

DROP VIEW IF EXISTS public.vw_print_bridge_comanda_items;
DROP VIEW IF EXISTS public.vw_print_bridge_order_items;

CREATE VIEW public.vw_print_bridge_comanda_items AS
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

CREATE VIEW public.vw_print_bridge_order_items AS
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

-- Garante que anon e authenticated possam ler as views (necessário para o Print Bridge local com anon key)
GRANT SELECT ON public.vw_print_bridge_comanda_items TO anon, authenticated;
GRANT SELECT ON public.vw_print_bridge_order_items TO anon, authenticated;