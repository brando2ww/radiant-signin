-- ============================================
-- FASE 0: Sistema de Controle de Módulos
-- ============================================

-- Enum para módulos disponíveis
CREATE TYPE public.user_module AS ENUM (
  'financeiro',
  'crm',
  'delivery',
  'pdv',
  'avaliacoes'
);

-- Tabela de módulos adquiridos por usuário
CREATE TABLE public.user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module user_module NOT NULL,
  is_active BOOLEAN DEFAULT true,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, module)
);

-- RLS
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios módulos"
  ON public.user_modules FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER handle_user_modules_updated_at
  BEFORE UPDATE ON public.user_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função helper para verificar acesso a módulo
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module user_module)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_modules
    WHERE user_id = _user_id
      AND module = _module
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- ============================================
-- FASE 1: Tabelas do PDV
-- ============================================

-- 1. Configurações do estabelecimento para PDV
CREATE TABLE public.pdv_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  salon_layout JSONB,
  shifts JSONB DEFAULT '[
    {"id": "manha", "name": "Manhã", "start": "06:00", "end": "14:00"},
    {"id": "tarde", "name": "Tarde", "start": "14:00", "end": "18:00"},
    {"id": "noite", "name": "Noite", "start": "18:00", "end": "23:00"}
  ]'::jsonb,
  
  auto_print_to_kitchen BOOLEAN DEFAULT true,
  require_customer_identification BOOLEAN DEFAULT false,
  enable_service_fee BOOLEAN DEFAULT true,
  service_fee_percentage NUMERIC(5,2) DEFAULT 10.00,
  
  requires_opening_balance BOOLEAN DEFAULT true,
  allow_negative_balance BOOLEAN DEFAULT false,
  
  integrate_with_delivery BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

ALTER TABLE public.pdv_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas configurações PDV"
  ON public.pdv_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_settings_updated_at
  BEFORE UPDATE ON public.pdv_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Insumos (ingredientes, matéria-prima)
CREATE TABLE public.pdv_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  current_stock NUMERIC(10,2) DEFAULT 0,
  min_stock NUMERIC(10,2) DEFAULT 0,
  expiration_date DATE,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de insumos"
  ON public.pdv_ingredients FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_ingredients_updated_at
  BEFORE UPDATE ON public.pdv_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Produtos PDV
CREATE TABLE public.pdv_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  
  price_salon NUMERIC(10,2) NOT NULL,
  price_balcao NUMERIC(10,2),
  price_delivery NUMERIC(10,2),
  
  preparation_time INTEGER DEFAULT 30,
  serves INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  
  available_times JSONB,
  
  is_sold_by_weight BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de produtos PDV"
  ON public.pdv_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_products_updated_at
  BEFORE UPDATE ON public.pdv_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Ficha técnica (receita)
CREATE TABLE public.pdv_product_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_product_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de receitas"
  ON public.pdv_product_recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_products
      WHERE pdv_products.id = pdv_product_recipes.product_id
        AND pdv_products.user_id = auth.uid()
    )
  );

-- 5. Adicionais/modificadores
CREATE TABLE public.pdv_product_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  affects_recipe BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_product_modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de modificadores PDV"
  ON public.pdv_product_modifiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_products
      WHERE pdv_products.id = pdv_product_modifiers.product_id
        AND pdv_products.user_id = auth.uid()
    )
  );

-- 6. Clientes PDV
CREATE TABLE public.pdv_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  email TEXT,
  birth_date DATE,
  notes TEXT,
  total_spent NUMERIC(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de clientes PDV"
  ON public.pdv_customers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_customers_updated_at
  BEFORE UPDATE ON public.pdv_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Status da mesa
CREATE TYPE public.pdv_table_status AS ENUM (
  'livre',
  'ocupada',
  'aguardando_pedido',
  'aguardando_cozinha',
  'pediu_conta',
  'pendente_pagamento'
);

-- 8. Mesas
CREATE TABLE public.pdv_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status pdv_table_status DEFAULT 'livre',
  position_x NUMERIC(10,2),
  position_y NUMERIC(10,2),
  shape TEXT DEFAULT 'square',
  current_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, table_number)
);

ALTER TABLE public.pdv_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de mesas"
  ON public.pdv_tables FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_tables_updated_at
  BEFORE UPDATE ON public.pdv_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Comandas
CREATE TABLE public.pdv_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  source TEXT NOT NULL,
  table_id UUID REFERENCES public.pdv_tables(id),
  
  customer_id UUID REFERENCES public.pdv_customers(id),
  customer_name TEXT,
  
  status TEXT NOT NULL DEFAULT 'aberta',
  
  subtotal NUMERIC(10,2) DEFAULT 0,
  service_fee NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  
  opened_by UUID REFERENCES auth.users(id),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  delivery_order_id UUID REFERENCES public.delivery_orders(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de pedidos PDV"
  ON public.pdv_orders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER handle_pdv_orders_updated_at
  BEFORE UPDATE ON public.pdv_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Itens da comanda
CREATE TABLE public.pdv_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.pdv_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.pdv_products(id),
  product_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  
  modifiers JSONB,
  notes TEXT,
  
  weight NUMERIC(10,2),
  
  kitchen_status TEXT DEFAULT 'pendente',
  sent_to_kitchen_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  
  assigned_to_person INTEGER,
  
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de itens PDV"
  ON public.pdv_order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_orders
      WHERE pdv_orders.id = pdv_order_items.order_id
        AND pdv_orders.user_id = auth.uid()
    )
  );

-- 11. Pagamentos
CREATE TABLE public.pdv_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.pdv_orders(id) ON DELETE CASCADE,
  
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  
  nsu TEXT,
  authorization_code TEXT,
  installments INTEGER DEFAULT 1,
  
  pix_txid TEXT,
  
  cash_received NUMERIC(10,2),
  change_amount NUMERIC(10,2),
  
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de pagamentos PDV"
  ON public.pdv_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_orders
      WHERE pdv_orders.id = pdv_payments.order_id
        AND pdv_orders.user_id = auth.uid()
    )
  );

-- 12. Tipo de movimento do caixa
CREATE TYPE public.pdv_cash_movement_type AS ENUM (
  'abertura',
  'venda',
  'sangria',
  'suprimento',
  'fechamento'
);

-- 13. Movimentos de caixa
CREATE TABLE public.pdv_cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type pdv_cash_movement_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  
  payment_method TEXT,
  order_id UUID REFERENCES public.pdv_orders(id),
  payment_id UUID REFERENCES public.pdv_payments(id),
  
  shift TEXT,
  shift_date DATE NOT NULL,
  
  handled_by UUID REFERENCES auth.users(id),
  handled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_cash_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de movimentos de caixa"
  ON public.pdv_cash_movements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14. Fechamento de caixa por turno
CREATE TABLE public.pdv_cash_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  shift TEXT NOT NULL,
  shift_date DATE NOT NULL,
  
  expected_cash NUMERIC(10,2) DEFAULT 0,
  expected_pix NUMERIC(10,2) DEFAULT 0,
  expected_credit NUMERIC(10,2) DEFAULT 0,
  expected_debit NUMERIC(10,2) DEFAULT 0,
  expected_meal_voucher NUMERIC(10,2) DEFAULT 0,
  
  counted_cash NUMERIC(10,2),
  counted_pix NUMERIC(10,2),
  counted_credit NUMERIC(10,2),
  counted_debit NUMERIC(10,2),
  counted_meal_voucher NUMERIC(10,2),
  
  difference_cash NUMERIC(10,2) DEFAULT 0,
  difference_pix NUMERIC(10,2) DEFAULT 0,
  difference_credit NUMERIC(10,2) DEFAULT 0,
  difference_debit NUMERIC(10,2) DEFAULT 0,
  difference_meal_voucher NUMERIC(10,2) DEFAULT 0,
  
  notes TEXT,
  
  closed_by UUID REFERENCES auth.users(id),
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, shift_date, shift)
);

ALTER TABLE public.pdv_cash_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de fechamentos de caixa"
  ON public.pdv_cash_closures FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 15. Tipo de movimento de estoque
CREATE TYPE public.pdv_stock_movement_type AS ENUM (
  'entrada',
  'saida_venda',
  'saida_perda',
  'ajuste'
);

-- 16. Movimentos de estoque
CREATE TABLE public.pdv_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  
  type pdv_stock_movement_type NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(10,2),
  
  order_item_id UUID REFERENCES public.pdv_order_items(id),
  
  reason TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de movimentos de estoque"
  ON public.pdv_stock_movements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pdv_ingredients
      WHERE pdv_ingredients.id = pdv_stock_movements.ingredient_id
        AND pdv_ingredients.user_id = auth.uid()
    )
  );

-- 17. CMV por período
CREATE TABLE public.pdv_cmv_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_cmv NUMERIC(10,2) DEFAULT 0,
  cmv_percentage NUMERIC(5,2) DEFAULT 0,
  
  product_margins JSONB,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pdv_cmv_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de CMV"
  ON public.pdv_cmv_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);