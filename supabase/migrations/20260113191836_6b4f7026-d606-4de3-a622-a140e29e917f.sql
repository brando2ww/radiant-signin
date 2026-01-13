-- Tabela para relação N:N entre ingredientes e fornecedores
CREATE TABLE public.pdv_ingredient_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  ingredient_id UUID REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE CASCADE NOT NULL,
  is_preferred BOOLEAN DEFAULT false,
  last_price NUMERIC,
  last_purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ingredient_id, supplier_id)
);

-- Tabela de solicitações de cotação
CREATE TABLE public.pdv_quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  request_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  deadline DATE,
  notes TEXT,
  message_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens da cotação
CREATE TABLE public.pdv_quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id UUID REFERENCES public.pdv_quotation_requests(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity_needed NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de respostas dos fornecedores
CREATE TABLE public.pdv_quotation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_item_id UUID REFERENCES public.pdv_quotation_items(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE CASCADE NOT NULL,
  unit_price NUMERIC,
  total_price NUMERIC,
  expiration_date DATE,
  delivery_days INTEGER,
  minimum_order NUMERIC,
  payment_terms TEXT,
  brand TEXT,
  origin TEXT,
  notes TEXT,
  is_winner BOOLEAN DEFAULT false,
  received_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pedidos de compra
CREATE TABLE public.pdv_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE SET NULL,
  quotation_request_id UUID REFERENCES public.pdv_quotation_requests(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled')),
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  freight NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  whatsapp_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens do pedido de compra
CREATE TABLE public.pdv_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.pdv_purchase_orders(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE NOT NULL,
  quotation_response_id UUID REFERENCES public.pdv_quotation_responses(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  quantity_received NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pdv_ingredient_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_quotation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdv_ingredient_suppliers
CREATE POLICY "Users can view their own ingredient suppliers"
ON public.pdv_ingredient_suppliers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ingredient suppliers"
ON public.pdv_ingredient_suppliers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredient suppliers"
ON public.pdv_ingredient_suppliers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredient suppliers"
ON public.pdv_ingredient_suppliers FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for pdv_quotation_requests
CREATE POLICY "Users can view their own quotation requests"
ON public.pdv_quotation_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotation requests"
ON public.pdv_quotation_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotation requests"
ON public.pdv_quotation_requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotation requests"
ON public.pdv_quotation_requests FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for pdv_quotation_items (via quotation_request)
CREATE POLICY "Users can view quotation items of their requests"
ON public.pdv_quotation_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_requests qr
  WHERE qr.id = quotation_request_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can create quotation items for their requests"
ON public.pdv_quotation_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pdv_quotation_requests qr
  WHERE qr.id = quotation_request_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can update quotation items of their requests"
ON public.pdv_quotation_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_requests qr
  WHERE qr.id = quotation_request_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can delete quotation items of their requests"
ON public.pdv_quotation_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_requests qr
  WHERE qr.id = quotation_request_id AND qr.user_id = auth.uid()
));

-- RLS Policies for pdv_quotation_responses (via quotation_item -> quotation_request)
CREATE POLICY "Users can view quotation responses of their requests"
ON public.pdv_quotation_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_items qi
  JOIN public.pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
  WHERE qi.id = quotation_item_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can create quotation responses for their requests"
ON public.pdv_quotation_responses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pdv_quotation_items qi
  JOIN public.pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
  WHERE qi.id = quotation_item_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can update quotation responses of their requests"
ON public.pdv_quotation_responses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_items qi
  JOIN public.pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
  WHERE qi.id = quotation_item_id AND qr.user_id = auth.uid()
));

CREATE POLICY "Users can delete quotation responses of their requests"
ON public.pdv_quotation_responses FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.pdv_quotation_items qi
  JOIN public.pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
  WHERE qi.id = quotation_item_id AND qr.user_id = auth.uid()
));

-- RLS Policies for pdv_purchase_orders
CREATE POLICY "Users can view their own purchase orders"
ON public.pdv_purchase_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase orders"
ON public.pdv_purchase_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders"
ON public.pdv_purchase_orders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders"
ON public.pdv_purchase_orders FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for pdv_purchase_order_items (via purchase_order)
CREATE POLICY "Users can view purchase order items of their orders"
ON public.pdv_purchase_order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.pdv_purchase_orders po
  WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
));

CREATE POLICY "Users can create purchase order items for their orders"
ON public.pdv_purchase_order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.pdv_purchase_orders po
  WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
));

CREATE POLICY "Users can update purchase order items of their orders"
ON public.pdv_purchase_order_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.pdv_purchase_orders po
  WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
));

CREATE POLICY "Users can delete purchase order items of their orders"
ON public.pdv_purchase_order_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.pdv_purchase_orders po
  WHERE po.id = purchase_order_id AND po.user_id = auth.uid()
));

-- Indexes for better performance
CREATE INDEX idx_ingredient_suppliers_user ON public.pdv_ingredient_suppliers(user_id);
CREATE INDEX idx_ingredient_suppliers_ingredient ON public.pdv_ingredient_suppliers(ingredient_id);
CREATE INDEX idx_ingredient_suppliers_supplier ON public.pdv_ingredient_suppliers(supplier_id);
CREATE INDEX idx_quotation_requests_user ON public.pdv_quotation_requests(user_id);
CREATE INDEX idx_quotation_requests_status ON public.pdv_quotation_requests(status);
CREATE INDEX idx_quotation_items_request ON public.pdv_quotation_items(quotation_request_id);
CREATE INDEX idx_quotation_responses_item ON public.pdv_quotation_responses(quotation_item_id);
CREATE INDEX idx_quotation_responses_supplier ON public.pdv_quotation_responses(supplier_id);
CREATE INDEX idx_purchase_orders_user ON public.pdv_purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_supplier ON public.pdv_purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.pdv_purchase_orders(status);
CREATE INDEX idx_purchase_order_items_order ON public.pdv_purchase_order_items(purchase_order_id);