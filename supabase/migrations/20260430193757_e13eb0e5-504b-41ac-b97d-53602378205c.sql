
-- ============================================================================
-- PARTE 1: Tipo de item da opção (insumo vs produto)
-- ============================================================================

ALTER TABLE public.pdv_product_option_items
  ADD COLUMN IF NOT EXISTS item_kind text NOT NULL DEFAULT 'ingredient';

ALTER TABLE public.pdv_product_option_items
  DROP CONSTRAINT IF EXISTS pdv_option_item_kind_check;
ALTER TABLE public.pdv_product_option_items
  ADD CONSTRAINT pdv_option_item_kind_check
  CHECK (item_kind IN ('ingredient','product'));

ALTER TABLE public.pdv_product_option_items
  DROP CONSTRAINT IF EXISTS pdv_option_item_kind_product_requires_link;
ALTER TABLE public.pdv_product_option_items
  ADD CONSTRAINT pdv_option_item_kind_product_requires_link
  CHECK (item_kind <> 'product' OR linked_product_id IS NOT NULL);

-- ============================================================================
-- PARTE 2: Sincronização PDV → Delivery
-- ============================================================================

ALTER TABLE public.delivery_products
  ADD COLUMN IF NOT EXISTS sync_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.delivery_product_options
  ADD COLUMN IF NOT EXISTS source_pdv_option_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS delivery_product_options_source_pdv_option_idx
  ON public.delivery_product_options(source_pdv_option_id)
  WHERE source_pdv_option_id IS NOT NULL;

ALTER TABLE public.delivery_product_option_items
  ADD COLUMN IF NOT EXISTS source_pdv_option_item_id uuid,
  ADD COLUMN IF NOT EXISTS linked_product_id uuid,
  ADD COLUMN IF NOT EXISTS item_kind text NOT NULL DEFAULT 'ingredient';

CREATE UNIQUE INDEX IF NOT EXISTS delivery_product_option_items_source_pdv_idx
  ON public.delivery_product_option_items(source_pdv_option_item_id)
  WHERE source_pdv_option_item_id IS NOT NULL;

-- ============================================================================
-- Função: sincroniza um produto PDV → delivery_products correspondente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_pdv_product_to_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dp RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Não removemos automaticamente — deixamos o lojista decidir.
    RETURN OLD;
  END IF;

  FOR v_dp IN
    SELECT id FROM public.delivery_products
     WHERE source_pdv_product_id = NEW.id
       AND COALESCE(sync_enabled, true) = true
  LOOP
    UPDATE public.delivery_products
       SET name = NEW.name,
           description = NEW.description,
           image_url = NEW.image_url,
           is_available = NEW.is_available,
           preparation_time = NEW.preparation_time,
           serves = NEW.serves,
           base_price = COALESCE(NEW.price_delivery, NEW.price_salon, base_price),
           updated_at = now()
     WHERE id = v_dp.id;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pdv_product_to_delivery ON public.pdv_products;
CREATE TRIGGER trg_sync_pdv_product_to_delivery
AFTER UPDATE ON public.pdv_products
FOR EACH ROW EXECUTE FUNCTION public.sync_pdv_product_to_delivery();

-- ============================================================================
-- Função: sincroniza opção PDV → delivery_product_options
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_pdv_option_to_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dp RECORD;
  v_target_id uuid;
  v_payload RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.delivery_product_options
     WHERE source_pdv_option_id = OLD.id;
    RETURN OLD;
  END IF;

  v_payload := NEW;

  FOR v_dp IN
    SELECT id, user_id FROM public.delivery_products
     WHERE source_pdv_product_id = v_payload.product_id
       AND COALESCE(sync_enabled, true) = true
  LOOP
    SELECT id INTO v_target_id
      FROM public.delivery_product_options
     WHERE source_pdv_option_id = v_payload.id
     LIMIT 1;

    IF v_target_id IS NULL THEN
      INSERT INTO public.delivery_product_options
        (product_id, name, type, is_required, min_selections, max_selections,
         order_position, source_pdv_option_id)
      VALUES
        (v_dp.id, v_payload.name, v_payload.type, v_payload.is_required,
         v_payload.min_selections, v_payload.max_selections,
         v_payload.order_position, v_payload.id);
    ELSE
      UPDATE public.delivery_product_options
         SET product_id = v_dp.id,
             name = v_payload.name,
             type = v_payload.type,
             is_required = v_payload.is_required,
             min_selections = v_payload.min_selections,
             max_selections = v_payload.max_selections,
             order_position = v_payload.order_position,
             updated_at = now()
       WHERE id = v_target_id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pdv_option_to_delivery ON public.pdv_product_options;
CREATE TRIGGER trg_sync_pdv_option_to_delivery
AFTER INSERT OR UPDATE OR DELETE ON public.pdv_product_options
FOR EACH ROW EXECUTE FUNCTION public.sync_pdv_option_to_delivery();

-- ============================================================================
-- Função: sincroniza item de opção PDV → delivery_product_option_items
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_pdv_option_item_to_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_target_option_id uuid;
  v_target_item_id uuid;
  v_target_linked uuid;
  v_payload RECORD;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.delivery_product_option_items
     WHERE source_pdv_option_item_id = OLD.id;
    RETURN OLD;
  END IF;

  v_payload := NEW;

  -- Para cada delivery_product_option espelhado da option pai
  FOR v_target_option_id IN
    SELECT dpo.id
      FROM public.delivery_product_options dpo
     WHERE dpo.source_pdv_option_id = v_payload.option_id
  LOOP
    -- Resolver linked_product_id no contexto do delivery
    v_target_linked := NULL;
    IF v_payload.linked_product_id IS NOT NULL THEN
      SELECT dp.id INTO v_target_linked
        FROM public.delivery_products dp
       WHERE dp.source_pdv_product_id = v_payload.linked_product_id
       LIMIT 1;
    END IF;

    SELECT id INTO v_target_item_id
      FROM public.delivery_product_option_items
     WHERE source_pdv_option_item_id = v_payload.id
       AND option_id = v_target_option_id
     LIMIT 1;

    IF v_target_item_id IS NULL THEN
      INSERT INTO public.delivery_product_option_items
        (option_id, name, price_adjustment, is_available, order_position,
         source_pdv_option_item_id, item_kind, linked_product_id)
      VALUES
        (v_target_option_id, v_payload.name, v_payload.price_adjustment,
         v_payload.is_available, v_payload.order_position,
         v_payload.id, v_payload.item_kind, v_target_linked);
    ELSE
      UPDATE public.delivery_product_option_items
         SET name = v_payload.name,
             price_adjustment = v_payload.price_adjustment,
             is_available = v_payload.is_available,
             order_position = v_payload.order_position,
             item_kind = v_payload.item_kind,
             linked_product_id = v_target_linked
       WHERE id = v_target_item_id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_pdv_option_item_to_delivery ON public.pdv_product_option_items;
CREATE TRIGGER trg_sync_pdv_option_item_to_delivery
AFTER INSERT OR UPDATE OR DELETE ON public.pdv_product_option_items
FOR EACH ROW EXECUTE FUNCTION public.sync_pdv_option_item_to_delivery();

-- ============================================================================
-- RPC: clonar opções PDV → delivery_product no momento do compartilhamento
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delivery_clone_options_from_pdv(p_pdv_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dp RECORD;
  v_opt RECORD;
  v_new_opt_id uuid;
  v_item RECORD;
  v_linked uuid;
  v_count int := 0;
BEGIN
  FOR v_dp IN
    SELECT id, user_id FROM public.delivery_products
     WHERE source_pdv_product_id = p_pdv_product_id
  LOOP
    FOR v_opt IN
      SELECT * FROM public.pdv_product_options
       WHERE product_id = p_pdv_product_id
       ORDER BY order_position
    LOOP
      SELECT id INTO v_new_opt_id
        FROM public.delivery_product_options
       WHERE source_pdv_option_id = v_opt.id
       LIMIT 1;

      IF v_new_opt_id IS NULL THEN
        INSERT INTO public.delivery_product_options
          (product_id, name, type, is_required, min_selections, max_selections,
           order_position, source_pdv_option_id)
        VALUES
          (v_dp.id, v_opt.name, v_opt.type, v_opt.is_required,
           v_opt.min_selections, v_opt.max_selections, v_opt.order_position, v_opt.id)
        RETURNING id INTO v_new_opt_id;
      END IF;

      FOR v_item IN
        SELECT * FROM public.pdv_product_option_items
         WHERE option_id = v_opt.id
         ORDER BY order_position
      LOOP
        v_linked := NULL;
        IF v_item.linked_product_id IS NOT NULL THEN
          SELECT dp2.id INTO v_linked
            FROM public.delivery_products dp2
           WHERE dp2.source_pdv_product_id = v_item.linked_product_id
           LIMIT 1;
        END IF;

        INSERT INTO public.delivery_product_option_items
          (option_id, name, price_adjustment, is_available, order_position,
           source_pdv_option_item_id, item_kind, linked_product_id)
        VALUES
          (v_new_opt_id, v_item.name, v_item.price_adjustment, v_item.is_available,
           v_item.order_position, v_item.id, v_item.item_kind, v_linked)
        ON CONFLICT DO NOTHING;
        v_count := v_count + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'items_seeded', v_count);
END;
$$;
