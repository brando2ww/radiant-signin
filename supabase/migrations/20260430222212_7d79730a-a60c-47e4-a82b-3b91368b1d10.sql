CREATE OR REPLACE FUNCTION public.pdv_block_items_when_awaiting_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.pdv_comandas WHERE id = NEW.comanda_id;
  IF v_status IN ('fechada','cancelada') THEN
    RAISE EXCEPTION 'Comanda não aceita novos itens (status: %)', v_status;
  END IF;
  RETURN NEW;
END;
$$;