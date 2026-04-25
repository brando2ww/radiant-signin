
-- 1) Extender pdv_comanda_items
ALTER TABLE public.pdv_comanda_items
  ADD COLUMN IF NOT EXISTS paid_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS charging_session_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_pdv_comanda_items_paid
  ON public.pdv_comanda_items (comanda_id, paid_quantity);

CREATE INDEX IF NOT EXISTS idx_pdv_comanda_items_charging
  ON public.pdv_comanda_items (charging_session_id)
  WHERE charging_session_id IS NOT NULL;

-- 2) Adicionar pending_subtotal em pdv_comandas
ALTER TABLE public.pdv_comandas
  ADD COLUMN IF NOT EXISTS pending_subtotal numeric NOT NULL DEFAULT 0;

-- 3) Atualizar trigger update_comanda_subtotal
CREATE OR REPLACE FUNCTION public.update_comanda_subtotal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_comanda_id uuid;
BEGIN
  v_comanda_id := COALESCE(NEW.comanda_id, OLD.comanda_id);

  UPDATE public.pdv_comandas
  SET subtotal = COALESCE((
        SELECT SUM(subtotal)
        FROM public.pdv_comanda_items
        WHERE comanda_id = v_comanda_id
      ), 0),
      pending_subtotal = COALESCE((
        SELECT SUM(unit_price * GREATEST(quantity - paid_quantity, 0))
        FROM public.pdv_comanda_items
        WHERE comanda_id = v_comanda_id
      ), 0),
      updated_at = now()
  WHERE id = v_comanda_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

-- Backfill de pending_subtotal
UPDATE public.pdv_comandas c
SET pending_subtotal = COALESCE((
  SELECT SUM(i.unit_price * GREATEST(i.quantity - i.paid_quantity, 0))
  FROM public.pdv_comanda_items i
  WHERE i.comanda_id = c.id
), 0);

-- 4) Tabela pdv_payment_items
CREATE TABLE IF NOT EXISTS public.pdv_payment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.pdv_payments(id) ON DELETE CASCADE,
  comanda_item_id uuid NOT NULL REFERENCES public.pdv_comanda_items(id) ON DELETE CASCADE,
  quantity_paid integer NOT NULL CHECK (quantity_paid > 0),
  unit_price numeric NOT NULL,
  subtotal_paid numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdv_payment_items_payment ON public.pdv_payment_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_pdv_payment_items_item ON public.pdv_payment_items(comanda_item_id);

ALTER TABLE public.pdv_payment_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage payment items" ON public.pdv_payment_items;
CREATE POLICY "Staff can manage payment items"
ON public.pdv_payment_items
FOR ALL
USING (EXISTS (
  SELECT 1
  FROM public.pdv_payments p
  JOIN public.pdv_orders o ON o.id = p.order_id
  WHERE p.id = pdv_payment_items.payment_id
    AND (o.user_id = auth.uid() OR public.is_establishment_member(o.user_id))
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.pdv_payments p
  JOIN public.pdv_orders o ON o.id = p.order_id
  WHERE p.id = pdv_payment_items.payment_id
    AND (o.user_id = auth.uid() OR public.is_establishment_member(o.user_id))
));

-- 5) RPC: lock atômico de itens
CREATE OR REPLACE FUNCTION public.pdv_lock_comanda_items(
  p_item_ids uuid[],
  p_session_id uuid
)
 RETURNS TABLE (locked_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.pdv_comanda_items i
  SET charging_session_id = p_session_id
  WHERE i.id = ANY(p_item_ids)
    AND (i.charging_session_id IS NULL OR i.charging_session_id = p_session_id)
    AND i.paid_quantity < i.quantity
    AND EXISTS (
      SELECT 1 FROM public.pdv_comandas c
      WHERE c.id = i.comanda_id
        AND (c.user_id = auth.uid() OR public.is_establishment_member(c.user_id))
    )
  RETURNING i.id;
END;
$function$;

-- 6) RPC: unlock
CREATE OR REPLACE FUNCTION public.pdv_unlock_comanda_items(
  p_item_ids uuid[],
  p_session_id uuid
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.pdv_comanda_items
  SET charging_session_id = NULL
  WHERE id = ANY(p_item_ids)
    AND charging_session_id = p_session_id;
END;
$function$;
