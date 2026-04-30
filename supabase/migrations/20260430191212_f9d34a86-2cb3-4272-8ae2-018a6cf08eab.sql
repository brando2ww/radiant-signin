-- =========================================================
-- 1. Enum de ações operacionais
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.pdv_permission_action AS ENUM (
    'change_table',
    'transfer_table_to_table',
    'transfer_comanda_to_comanda',
    'transfer_table_to_comanda',
    'transfer_comanda_to_table',
    'close_attendance',
    'cancel_item',
    'cancel_paid_item',
    'apply_discount',
    'remove_service_fee',
    'view_history',
    'process_payment',
    'refund_payment'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 2. Permissões por perfil
-- =========================================================
CREATE TABLE IF NOT EXISTS public.pdv_action_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  action public.pdv_permission_action NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  requires_reason boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, role, action)
);

-- Garçom NUNCA pode receber process_payment
ALTER TABLE public.pdv_action_permissions
  DROP CONSTRAINT IF EXISTS pdv_action_permissions_no_waiter_payment;
ALTER TABLE public.pdv_action_permissions
  ADD CONSTRAINT pdv_action_permissions_no_waiter_payment
  CHECK (NOT (role = 'garcom' AND action IN ('process_payment','refund_payment','remove_service_fee','cancel_paid_item') AND allowed = true));

ALTER TABLE public.pdv_action_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members can read permissions" ON public.pdv_action_permissions;
CREATE POLICY "members can read permissions"
  ON public.pdv_action_permissions FOR SELECT
  USING (owner_user_id = auth.uid() OR public.is_establishment_member(owner_user_id));

DROP POLICY IF EXISTS "owner can manage permissions" ON public.pdv_action_permissions;
CREATE POLICY "owner can manage permissions"
  ON public.pdv_action_permissions FOR ALL
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE TRIGGER trg_pdv_action_permissions_updated_at
  BEFORE UPDATE ON public.pdv_action_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================
-- 3. Auditoria operacional
-- =========================================================
CREATE TABLE IF NOT EXISTS public.pdv_action_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  actor_role public.app_role,
  action public.pdv_permission_action NOT NULL,
  source_type text,
  source_id uuid,
  target_type text,
  target_id uuid,
  payload jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdv_audit_owner_created
  ON public.pdv_action_audit_log (owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdv_audit_source
  ON public.pdv_action_audit_log (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_pdv_audit_target
  ON public.pdv_action_audit_log (target_type, target_id);

ALTER TABLE public.pdv_action_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members can read audit" ON public.pdv_action_audit_log;
CREATE POLICY "members can read audit"
  ON public.pdv_action_audit_log FOR SELECT
  USING (owner_user_id = auth.uid() OR public.is_establishment_member(owner_user_id));

-- inserts apenas via funções security definer
DROP POLICY IF EXISTS "no direct insert audit" ON public.pdv_action_audit_log;
CREATE POLICY "no direct insert audit"
  ON public.pdv_action_audit_log FOR INSERT
  WITH CHECK (false);

-- =========================================================
-- 4. Colunas auxiliares em pdv_orders / pdv_comandas
-- =========================================================
ALTER TABLE public.pdv_orders
  ADD COLUMN IF NOT EXISTS closed_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS service_fee_paid numeric NOT NULL DEFAULT 0;

ALTER TABLE public.pdv_comandas
  ADD COLUMN IF NOT EXISTS closed_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS close_reason text;

-- =========================================================
-- 5. Helper: resolve owner_user_id para o usuário atual
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_resolve_owner(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT establishment_owner_id FROM public.establishment_users
      WHERE user_id = _user_id AND is_active = true LIMIT 1),
    _user_id
  )
$$;

-- =========================================================
-- 6. Helper: role efetivo do usuário no estabelecimento
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.establishment_users
      WHERE user_id = _user_id AND is_active = true LIMIT 1),
    'proprietario'::public.app_role
  )
$$;

-- =========================================================
-- 7. Função has_pdv_action (com defaults seguros)
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_pdv_action(_user_id uuid, _action public.pdv_permission_action)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_role public.app_role;
  v_row RECORD;
BEGIN
  IF _user_id IS NULL THEN RETURN false; END IF;
  v_owner := public.pdv_resolve_owner(_user_id);
  v_role  := public.pdv_user_role(_user_id);

  -- Garçom NUNCA pode pagar/estornar/remover taxa/cancelar item pago
  IF v_role = 'garcom' AND _action IN ('process_payment','refund_payment','remove_service_fee','cancel_paid_item') THEN
    RETURN false;
  END IF;

  -- Linha explícita prevalece
  SELECT * INTO v_row FROM public.pdv_action_permissions
   WHERE owner_user_id = v_owner AND role = v_role AND action = _action;
  IF FOUND THEN RETURN v_row.allowed; END IF;

  -- Defaults
  IF v_role IN ('proprietario','gerente') THEN RETURN true; END IF;

  IF v_role = 'caixa' THEN
    RETURN _action IN (
      'change_table','transfer_table_to_table','transfer_comanda_to_comanda',
      'transfer_table_to_comanda','transfer_comanda_to_table','close_attendance',
      'cancel_item','cancel_paid_item','apply_discount','remove_service_fee',
      'view_history','process_payment','refund_payment'
    );
  END IF;

  IF v_role = 'garcom' THEN
    RETURN _action IN (
      'change_table','transfer_table_to_table','transfer_comanda_to_comanda',
      'transfer_table_to_comanda','transfer_comanda_to_table','close_attendance',
      'cancel_item','view_history'
    );
  END IF;

  RETURN false;
END;
$$;

-- =========================================================
-- 8. Helper: registra auditoria
-- =========================================================
CREATE OR REPLACE FUNCTION public.log_pdv_action(
  _action public.pdv_permission_action,
  _source_type text,
  _source_id uuid,
  _target_type text,
  _target_id uuid,
  _payload jsonb,
  _reason text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_owner uuid;
BEGIN
  v_owner := public.pdv_resolve_owner(auth.uid());
  INSERT INTO public.pdv_action_audit_log
    (owner_user_id, actor_user_id, actor_role, action,
     source_type, source_id, target_type, target_id, payload, reason)
  VALUES
    (v_owner, auth.uid(), public.pdv_user_role(auth.uid()), _action,
     _source_type, _source_id, _target_type, _target_id, _payload, _reason)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- =========================================================
-- 9. RPC: encerrar atendimento (não libera mesa)
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_close_attendance(
  p_comanda_id uuid,
  p_close_whole_table boolean DEFAULT false,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_comanda RECORD;
  v_now timestamptz := now();
BEGIN
  IF NOT public.has_pdv_action(auth.uid(), 'close_attendance') THEN
    RAISE EXCEPTION 'Sem permissão para encerrar atendimento';
  END IF;

  SELECT c.*, o.id AS o_id, o.user_id AS o_owner
    INTO v_comanda
  FROM public.pdv_comandas c
  LEFT JOIN public.pdv_orders o ON o.id = c.order_id
  WHERE c.id = p_comanda_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Comanda não encontrada'; END IF;
  v_owner := public.pdv_resolve_owner(auth.uid());
  IF v_comanda.user_id <> v_owner THEN RAISE EXCEPTION 'Comanda de outro estabelecimento'; END IF;

  IF v_comanda.status IN ('fechada','cancelada') THEN
    RAISE EXCEPTION 'Comanda já finalizada';
  END IF;

  IF p_close_whole_table AND v_comanda.order_id IS NOT NULL THEN
    UPDATE public.pdv_comandas
       SET status = 'aguardando_pagamento',
           closed_by_user_id = auth.uid(),
           closed_by_waiter_at = v_now,
           close_reason = p_reason,
           updated_at = v_now
     WHERE order_id = v_comanda.order_id
       AND status NOT IN ('fechada','cancelada');

    UPDATE public.pdv_orders
       SET status = 'pendente_pagamento',
           closed_by_user_id = auth.uid(),
           closed_at = v_now,
           updated_at = v_now
     WHERE id = v_comanda.order_id;
  ELSE
    UPDATE public.pdv_comandas
       SET status = 'aguardando_pagamento',
           closed_by_user_id = auth.uid(),
           closed_by_waiter_at = v_now,
           close_reason = p_reason,
           updated_at = v_now
     WHERE id = p_comanda_id;
  END IF;

  PERFORM public.log_pdv_action(
    'close_attendance', 'comanda', p_comanda_id,
    CASE WHEN p_close_whole_table THEN 'order' ELSE NULL END,
    CASE WHEN p_close_whole_table THEN v_comanda.order_id ELSE NULL END,
    jsonb_build_object('whole_table', p_close_whole_table),
    p_reason
  );

  RETURN jsonb_build_object('ok', true, 'comanda_id', p_comanda_id, 'whole_table', p_close_whole_table);
END;
$$;

-- =========================================================
-- 10. RPC: trocar mesa
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_change_table(
  p_source_table_id uuid,
  p_target_table_id uuid,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_src RECORD;
  v_dst RECORD;
BEGIN
  IF NOT public.has_pdv_action(auth.uid(), 'change_table') THEN
    RAISE EXCEPTION 'Sem permissão para trocar mesa';
  END IF;
  IF p_source_table_id = p_target_table_id THEN
    RAISE EXCEPTION 'Mesa origem e destino são iguais';
  END IF;

  SELECT * INTO v_src FROM public.pdv_tables WHERE id = p_source_table_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mesa de origem não encontrada'; END IF;
  SELECT * INTO v_dst FROM public.pdv_tables WHERE id = p_target_table_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mesa de destino não encontrada'; END IF;

  v_owner := public.pdv_resolve_owner(auth.uid());
  IF v_src.user_id <> v_owner OR v_dst.user_id <> v_owner THEN
    RAISE EXCEPTION 'Mesa de outro estabelecimento';
  END IF;

  IF v_src.current_order_id IS NULL THEN
    RAISE EXCEPTION 'Mesa de origem está livre';
  END IF;
  IF v_dst.current_order_id IS NOT NULL OR v_dst.status <> 'livre' THEN
    RAISE EXCEPTION 'Mesa de destino não está livre';
  END IF;

  -- Atualiza order para apontar à nova mesa
  UPDATE public.pdv_orders
     SET table_id = p_target_table_id,
         updated_at = now()
   WHERE id = v_src.current_order_id;

  -- Move ocupação
  UPDATE public.pdv_tables
     SET current_order_id = v_src.current_order_id,
         status = v_src.status,
         updated_at = now()
   WHERE id = p_target_table_id;

  UPDATE public.pdv_tables
     SET current_order_id = NULL,
         status = 'livre',
         updated_at = now()
   WHERE id = p_source_table_id;

  PERFORM public.log_pdv_action(
    'change_table', 'table', p_source_table_id, 'table', p_target_table_id,
    jsonb_build_object('order_id', v_src.current_order_id),
    p_reason
  );

  RETURN jsonb_build_object('ok', true, 'order_id', v_src.current_order_id);
END;
$$;

-- =========================================================
-- 11. RPC: split de item de comanda (helper)
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_split_comanda_item(
  p_item_id uuid,
  p_qty numeric
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_remaining numeric;
  v_new_id uuid;
BEGIN
  SELECT * INTO v_item FROM public.pdv_comanda_items WHERE id = p_item_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item não encontrado'; END IF;
  IF p_qty <= 0 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;

  v_remaining := v_item.quantity - COALESCE(v_item.paid_quantity, 0);
  IF p_qty > v_remaining THEN
    RAISE EXCEPTION 'Quantidade excede o restante (% disponível)', v_remaining;
  END IF;

  IF p_qty = v_item.quantity AND COALESCE(v_item.paid_quantity,0) = 0 THEN
    RETURN p_item_id; -- nada a dividir
  END IF;

  -- Cria item-irmão com p_qty (pendente, sem charging_session)
  INSERT INTO public.pdv_comanda_items (
    comanda_id, product_id, product_name, quantity, unit_price,
    subtotal, modifiers, notes, kitchen_status, paid_quantity, created_by, status
  )
  SELECT comanda_id, product_id, product_name, p_qty, unit_price,
         (unit_price * p_qty), modifiers, notes, kitchen_status, 0, created_by,
         COALESCE(status, 'ativo')
    FROM public.pdv_comanda_items WHERE id = p_item_id
  RETURNING id INTO v_new_id;

  -- Reduz o original
  UPDATE public.pdv_comanda_items
     SET quantity = quantity - p_qty,
         subtotal = unit_price * (quantity - p_qty),
         updated_at = now()
   WHERE id = p_item_id;

  RETURN v_new_id;
END;
$$;

-- =========================================================
-- 12. RPC: transferir itens (com qty parcial e destino mesa/comanda)
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_transfer_items(
  p_item_ids uuid[],
  p_qty_map jsonb,         -- {item_id: qty}; null/ausente = qty integral restante
  p_target_kind text,      -- 'comanda' | 'table'
  p_target_id uuid,        -- comanda_id OU table_id
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_role public.app_role;
  v_target_comanda_id uuid;
  v_target_order_id uuid;
  v_table RECORD;
  v_item RECORD;
  v_qty numeric;
  v_split_id uuid;
  v_action public.pdv_permission_action;
  v_source_kinds text[] := ARRAY[]::text[];
  v_moved jsonb := '[]'::jsonb;
BEGIN
  IF p_item_ids IS NULL OR array_length(p_item_ids,1) IS NULL THEN
    RAISE EXCEPTION 'Nenhum item selecionado';
  END IF;
  IF p_target_kind NOT IN ('comanda','table') THEN
    RAISE EXCEPTION 'Destino inválido';
  END IF;

  v_owner := public.pdv_resolve_owner(auth.uid());
  v_role  := public.pdv_user_role(auth.uid());

  -- Resolve comanda destino
  IF p_target_kind = 'comanda' THEN
    SELECT id, order_id INTO v_target_comanda_id, v_target_order_id
      FROM public.pdv_comandas WHERE id = p_target_id AND user_id = v_owner;
    IF NOT FOUND THEN RAISE EXCEPTION 'Comanda destino não encontrada'; END IF;
  ELSE
    SELECT * INTO v_table FROM public.pdv_tables WHERE id = p_target_id AND user_id = v_owner;
    IF NOT FOUND THEN RAISE EXCEPTION 'Mesa destino não encontrada'; END IF;

    IF v_table.current_order_id IS NULL THEN
      -- Cria order + comanda na mesa destino
      INSERT INTO public.pdv_orders (user_id, table_id, source, status, order_number, opened_by, opened_at)
      VALUES (v_owner, v_table.id, 'salao', 'aberto',
              'ORD-' || to_char(now(),'YYYYMMDDHH24MISS'),
              auth.uid(), now())
      RETURNING id INTO v_target_order_id;

      INSERT INTO public.pdv_comandas (user_id, order_id, comanda_number, status)
      VALUES (v_owner, v_target_order_id,
              'CMD-' || to_char(now(),'YYYYMMDDHH24MISS'),
              'aberta')
      RETURNING id INTO v_target_comanda_id;

      UPDATE public.pdv_tables
         SET current_order_id = v_target_order_id,
             status = 'ocupada',
             updated_at = now()
       WHERE id = v_table.id;
    ELSE
      v_target_order_id := v_table.current_order_id;
      SELECT id INTO v_target_comanda_id
        FROM public.pdv_comandas
       WHERE order_id = v_target_order_id AND status = 'aberta'
       ORDER BY created_at ASC LIMIT 1;
      IF v_target_comanda_id IS NULL THEN
        INSERT INTO public.pdv_comandas (user_id, order_id, comanda_number, status)
        VALUES (v_owner, v_target_order_id,
                'CMD-' || to_char(now(),'YYYYMMDDHH24MISS'),
                'aberta')
        RETURNING id INTO v_target_comanda_id;
      END IF;
    END IF;
  END IF;

  -- Itera itens
  FOR v_item IN
    SELECT ci.*, c.order_id AS src_order_id, c.user_id AS src_owner
      FROM public.pdv_comanda_items ci
      JOIN public.pdv_comandas c ON c.id = ci.comanda_id
     WHERE ci.id = ANY(p_item_ids)
     FOR UPDATE
  LOOP
    IF v_item.src_owner <> v_owner THEN
      RAISE EXCEPTION 'Item de outro estabelecimento';
    END IF;
    IF v_item.comanda_id = v_target_comanda_id THEN
      CONTINUE;
    END IF;
    IF COALESCE(v_item.paid_quantity,0) >= v_item.quantity THEN
      RAISE EXCEPTION 'Item % já totalmente pago', v_item.product_name;
    END IF;
    IF COALESCE(v_item.status,'ativo') = 'cancelado' THEN
      RAISE EXCEPTION 'Item % está cancelado', v_item.product_name;
    END IF;
    IF v_item.charging_session_id IS NOT NULL THEN
      RAISE EXCEPTION 'Item % está em cobrança', v_item.product_name;
    END IF;

    v_qty := COALESCE((p_qty_map->>v_item.id::text)::numeric,
                      v_item.quantity - COALESCE(v_item.paid_quantity,0));

    IF v_qty < (v_item.quantity - COALESCE(v_item.paid_quantity,0)) THEN
      v_split_id := public.pdv_split_comanda_item(v_item.id, v_qty);
      UPDATE public.pdv_comanda_items
         SET comanda_id = v_target_comanda_id, updated_at = now()
       WHERE id = v_split_id;
      v_moved := v_moved || jsonb_build_object('item_id', v_split_id, 'qty', v_qty, 'from_item', v_item.id);
    ELSE
      UPDATE public.pdv_comanda_items
         SET comanda_id = v_target_comanda_id, updated_at = now()
       WHERE id = v_item.id;
      v_moved := v_moved || jsonb_build_object('item_id', v_item.id, 'qty', v_qty);
    END IF;

    -- Determina action específica para auditoria (mesa↔comanda)
    IF v_item.src_order_id IS NOT NULL AND p_target_kind = 'table' THEN
      v_action := 'transfer_table_to_table';
    ELSIF v_item.src_order_id IS NOT NULL AND p_target_kind = 'comanda' THEN
      v_action := 'transfer_table_to_comanda';
    ELSIF v_item.src_order_id IS NULL AND p_target_kind = 'table' THEN
      v_action := 'transfer_comanda_to_table';
    ELSE
      v_action := 'transfer_comanda_to_comanda';
    END IF;

    IF NOT public.has_pdv_action(auth.uid(), v_action) THEN
      RAISE EXCEPTION 'Sem permissão para esta transferência';
    END IF;
  END LOOP;

  PERFORM public.log_pdv_action(
    'transfer_comanda_to_comanda', -- action genérica; detalhes no payload
    'comanda', NULL,
    p_target_kind, p_target_id,
    jsonb_build_object('items', v_moved, 'target_kind', p_target_kind),
    p_reason
  );

  RETURN jsonb_build_object('ok', true, 'target_comanda_id', v_target_comanda_id, 'moved', v_moved);
END;
$$;

-- =========================================================
-- 13. Trigger: bloquear adicionar itens em comanda aguardando pagamento
-- =========================================================
CREATE OR REPLACE FUNCTION public.pdv_block_items_when_awaiting_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.pdv_comandas WHERE id = NEW.comanda_id;
  IF v_status IN ('aguardando_pagamento','em_cobranca','fechada','cancelada') THEN
    RAISE EXCEPTION 'Comanda não aceita novos itens (status: %)', v_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_items_awaiting_payment ON public.pdv_comanda_items;
CREATE TRIGGER trg_block_items_awaiting_payment
  BEFORE INSERT ON public.pdv_comanda_items
  FOR EACH ROW EXECUTE FUNCTION public.pdv_block_items_when_awaiting_payment();
