-- SISTEMA DE DELIVERY - Estrutura Completa do Banco de Dados

-- 1. Tabela: delivery_categories (Categorias do Cardápio)
CREATE TABLE public.delivery_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  order_position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabela: delivery_products (Produtos do Cardápio)
CREATE TABLE public.delivery_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price NUMERIC NOT NULL,
  promotional_price NUMERIC,
  preparation_time INTEGER DEFAULT 30,
  serves INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id) REFERENCES public.delivery_categories(id) ON DELETE CASCADE
);

-- 3. Tabela: delivery_product_options (Opções/Complementos)
CREATE TABLE public.delivery_product_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  order_position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES public.delivery_products(id) ON DELETE CASCADE
);

-- 4. Tabela: delivery_product_option_items (Itens das Opções)
CREATE TABLE public.delivery_product_option_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL,
  name TEXT NOT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  order_position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (option_id) REFERENCES public.delivery_product_options(id) ON DELETE CASCADE
);

-- 5. Tabela: delivery_customers (Clientes do Delivery)
CREATE TABLE public.delivery_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  cpf TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Tabela: delivery_addresses (Endereços de Entrega)
CREATE TABLE public.delivery_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  label TEXT DEFAULT 'Casa',
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  reference TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (customer_id) REFERENCES public.delivery_customers(id) ON DELETE CASCADE
);

-- 7. Tabela: delivery_coupons (Cupons de Desconto)
CREATE TABLE public.delivery_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage',
  value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  usage_limit INTEGER DEFAULT 999999,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Tabela: delivery_orders (Pedidos)
CREATE TABLE public.delivery_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address_id UUID,
  delivery_address_text TEXT,
  order_type TEXT NOT NULL DEFAULT 'delivery',
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  change_for NUMERIC,
  notes TEXT,
  estimated_time INTEGER DEFAULT 45,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (customer_id) REFERENCES public.delivery_customers(id),
  FOREIGN KEY (delivery_address_id) REFERENCES public.delivery_addresses(id)
);

-- 9. Tabela: delivery_order_items (Itens do Pedido)
CREATE TABLE public.delivery_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES public.delivery_products(id)
);

-- 10. Tabela: delivery_order_item_options (Opções dos Itens)
CREATE TABLE public.delivery_order_item_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL,
  option_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  FOREIGN KEY (order_item_id) REFERENCES public.delivery_order_items(id) ON DELETE CASCADE
);

-- 11. Tabela: delivery_settings (Configurações do Delivery)
CREATE TABLE public.delivery_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_open BOOLEAN DEFAULT true,
  auto_accept_orders BOOLEAN DEFAULT false,
  min_order_value NUMERIC DEFAULT 0,
  default_delivery_fee NUMERIC DEFAULT 5.00,
  estimated_preparation_time INTEGER DEFAULT 45,
  max_delivery_distance NUMERIC DEFAULT 10.0,
  accepts_pix BOOLEAN DEFAULT true,
  pix_key TEXT,
  accepts_credit BOOLEAN DEFAULT true,
  accepts_debit BOOLEAN DEFAULT true,
  accepts_cash BOOLEAN DEFAULT true,
  delivery_zones JSONB DEFAULT '[]'::jsonb,
  business_hours JSONB DEFAULT '{"monday": {"open": "18:00", "close": "23:00"}, "tuesday": {"open": "18:00", "close": "23:00"}, "wednesday": {"open": "18:00", "close": "23:00"}, "thursday": {"open": "18:00", "close": "23:00"}, "friday": {"open": "18:00", "close": "23:00"}, "saturday": {"open": "18:00", "close": "23:00"}, "sunday": {"open": "18:00", "close": "23:00"}}'::jsonb,
  blocked_dates JSONB DEFAULT '[]'::jsonb,
  whatsapp_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Tabela: delivery_reviews (Avaliações de Pedidos)
CREATE TABLE public.delivery_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (order_id) REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES public.delivery_customers(id)
);

-- Criar índices para melhor performance
CREATE INDEX idx_delivery_products_category ON public.delivery_products(category_id);
CREATE INDEX idx_delivery_products_user ON public.delivery_products(user_id);
CREATE INDEX idx_delivery_orders_user ON public.delivery_orders(user_id);
CREATE INDEX idx_delivery_orders_customer ON public.delivery_orders(customer_id);
CREATE INDEX idx_delivery_orders_status ON public.delivery_orders(status);
CREATE INDEX idx_delivery_orders_created ON public.delivery_orders(created_at DESC);

-- RLS Policies

-- delivery_categories
ALTER TABLE public.delivery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias categorias"
  ON public.delivery_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias"
  ON public.delivery_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias"
  ON public.delivery_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias"
  ON public.delivery_categories FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Público pode ver categorias ativas"
  ON public.delivery_categories FOR SELECT
  USING (is_active = true);

-- delivery_products
ALTER TABLE public.delivery_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios produtos"
  ON public.delivery_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios produtos"
  ON public.delivery_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios produtos"
  ON public.delivery_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios produtos"
  ON public.delivery_products FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Público pode ver produtos disponíveis"
  ON public.delivery_products FOR SELECT
  USING (is_available = true);

-- delivery_product_options
ALTER TABLE public.delivery_product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar opções de seus produtos"
  ON public.delivery_product_options FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.delivery_products
    WHERE delivery_products.id = delivery_product_options.product_id
    AND delivery_products.user_id = auth.uid()
  ));

CREATE POLICY "Público pode ver opções de produtos disponíveis"
  ON public.delivery_product_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.delivery_products
    WHERE delivery_products.id = delivery_product_options.product_id
    AND delivery_products.is_available = true
  ));

-- delivery_product_option_items
ALTER TABLE public.delivery_product_option_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar itens de opções"
  ON public.delivery_product_option_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.delivery_product_options
    JOIN public.delivery_products ON delivery_products.id = delivery_product_options.product_id
    WHERE delivery_product_options.id = delivery_product_option_items.option_id
    AND delivery_products.user_id = auth.uid()
  ));

CREATE POLICY "Público pode ver itens de opções disponíveis"
  ON public.delivery_product_option_items FOR SELECT
  USING (is_available = true);

-- delivery_customers
ALTER TABLE public.delivery_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver seus próprios dados"
  ON public.delivery_customers FOR SELECT
  USING (true);

CREATE POLICY "Qualquer pessoa pode criar cliente"
  ON public.delivery_customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem atualizar seus próprios dados"
  ON public.delivery_customers FOR UPDATE
  USING (true);

-- delivery_addresses
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver seus endereços"
  ON public.delivery_addresses FOR SELECT
  USING (true);

CREATE POLICY "Clientes podem criar seus endereços"
  ON public.delivery_addresses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem atualizar seus endereços"
  ON public.delivery_addresses FOR UPDATE
  USING (true);

CREATE POLICY "Clientes podem deletar seus endereços"
  ON public.delivery_addresses FOR DELETE
  USING (true);

-- delivery_coupons
ALTER TABLE public.delivery_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios cupons"
  ON public.delivery_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios cupons"
  ON public.delivery_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios cupons"
  ON public.delivery_coupons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios cupons"
  ON public.delivery_coupons FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Público pode ver cupons ativos"
  ON public.delivery_coupons FOR SELECT
  USING (is_active = true AND valid_until > now());

-- delivery_orders
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver pedidos de seu estabelecimento"
  ON public.delivery_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar pedidos de seu estabelecimento"
  ON public.delivery_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Qualquer pessoa pode criar pedidos"
  ON public.delivery_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clientes podem ver seus próprios pedidos"
  ON public.delivery_orders FOR SELECT
  USING (true);

-- delivery_order_items
ALTER TABLE public.delivery_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de seus pedidos"
  ON public.delivery_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.delivery_orders
    WHERE delivery_orders.id = delivery_order_items.order_id
    AND delivery_orders.user_id = auth.uid()
  ));

CREATE POLICY "Qualquer pessoa pode criar itens de pedido"
  ON public.delivery_order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Público pode ver itens de pedidos"
  ON public.delivery_order_items FOR SELECT
  USING (true);

-- delivery_order_item_options
ALTER TABLE public.delivery_order_item_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público a opções de itens"
  ON public.delivery_order_item_options FOR ALL
  USING (true)
  WITH CHECK (true);

-- delivery_settings
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON public.delivery_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações"
  ON public.delivery_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON public.delivery_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Público pode ver configurações básicas"
  ON public.delivery_settings FOR SELECT
  USING (true);

-- delivery_reviews
ALTER TABLE public.delivery_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver avaliações de seus pedidos"
  ON public.delivery_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.delivery_orders
    WHERE delivery_orders.id = delivery_reviews.order_id
    AND delivery_orders.user_id = auth.uid()
  ));

CREATE POLICY "Clientes podem criar avaliações"
  ON public.delivery_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Público pode ver avaliações"
  ON public.delivery_reviews FOR SELECT
  USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_delivery_categories_updated_at
  BEFORE UPDATE ON public.delivery_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_delivery_products_updated_at
  BEFORE UPDATE ON public.delivery_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_delivery_customers_updated_at
  BEFORE UPDATE ON public.delivery_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON public.delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_delivery_settings_updated_at
  BEFORE UPDATE ON public.delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();