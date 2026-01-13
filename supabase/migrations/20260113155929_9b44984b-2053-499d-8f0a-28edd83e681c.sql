-- Create pdv_comandas table for managing individual tabs/comandas
CREATE TABLE public.pdv_comandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.pdv_orders(id) ON DELETE SET NULL,
  comanda_number TEXT NOT NULL,
  customer_name TEXT,
  person_number INTEGER,
  status TEXT NOT NULL DEFAULT 'aberta',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pdv_comanda_items table for items in each comanda
CREATE TABLE public.pdv_comanda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comanda_id UUID NOT NULL REFERENCES public.pdv_comandas(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  notes TEXT,
  modifiers JSONB,
  kitchen_status TEXT NOT NULL DEFAULT 'pendente',
  sent_to_kitchen_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.pdv_comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_comanda_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for pdv_comandas
CREATE POLICY "Users can manage their own comandas"
ON public.pdv_comandas
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for pdv_comanda_items
CREATE POLICY "Users can view items from their comandas"
ON public.pdv_comanda_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.pdv_comandas
  WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
  AND pdv_comandas.user_id = auth.uid()
));

CREATE POLICY "Users can insert items to their comandas"
ON public.pdv_comanda_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pdv_comandas
  WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
  AND pdv_comandas.user_id = auth.uid()
));

CREATE POLICY "Users can update items from their comandas"
ON public.pdv_comanda_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.pdv_comandas
  WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
  AND pdv_comandas.user_id = auth.uid()
));

CREATE POLICY "Users can delete items from their comandas"
ON public.pdv_comanda_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.pdv_comandas
  WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
  AND pdv_comandas.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_pdv_comandas_user_id ON public.pdv_comandas(user_id);
CREATE INDEX idx_pdv_comandas_order_id ON public.pdv_comandas(order_id);
CREATE INDEX idx_pdv_comandas_status ON public.pdv_comandas(status);
CREATE INDEX idx_pdv_comanda_items_comanda_id ON public.pdv_comanda_items(comanda_id);
CREATE INDEX idx_pdv_comanda_items_kitchen_status ON public.pdv_comanda_items(kitchen_status);

-- Function to update comanda subtotal when items change
CREATE OR REPLACE FUNCTION public.update_comanda_subtotal()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.pdv_comandas
    SET subtotal = COALESCE((
      SELECT SUM(subtotal) FROM public.pdv_comanda_items WHERE comanda_id = OLD.comanda_id
    ), 0),
    updated_at = now()
    WHERE id = OLD.comanda_id;
    RETURN OLD;
  ELSE
    UPDATE public.pdv_comandas
    SET subtotal = COALESCE((
      SELECT SUM(subtotal) FROM public.pdv_comanda_items WHERE comanda_id = NEW.comanda_id
    ), 0),
    updated_at = now()
    WHERE id = NEW.comanda_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update comanda subtotal
CREATE TRIGGER update_comanda_subtotal_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.pdv_comanda_items
FOR EACH ROW
EXECUTE FUNCTION public.update_comanda_subtotal();