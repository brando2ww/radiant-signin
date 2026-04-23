UPDATE public.pdv_cashier_sessions s
SET total_withdrawals = COALESCE((
  SELECT SUM(m.amount)
  FROM public.pdv_cashier_movements m
  WHERE m.cashier_session_id = s.id
    AND m.type = 'sangria'
), 0);