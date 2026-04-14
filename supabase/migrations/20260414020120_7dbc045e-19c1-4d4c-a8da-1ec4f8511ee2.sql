
-- 3.3: Employee consumption table
CREATE TABLE public.pdv_employee_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  comanda_id UUID REFERENCES public.pdv_comandas(id) ON DELETE SET NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aberta',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.pdv_employee_consumption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage employee consumption"
  ON public.pdv_employee_consumption FOR ALL
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

-- 3.4: Printer station column
ALTER TABLE public.pdv_products
  ADD COLUMN IF NOT EXISTS printer_station TEXT NOT NULL DEFAULT 'cozinha';
