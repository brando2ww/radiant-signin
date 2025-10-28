-- Adicionar novos campos à tabela pdv_ingredients
ALTER TABLE public.pdv_ingredients
  ADD COLUMN code TEXT UNIQUE,
  ADD COLUMN category TEXT,
  ADD COLUMN loss_percentage NUMERIC DEFAULT 0,
  ADD COLUMN selling_price NUMERIC DEFAULT 0,
  ADD COLUMN icms_rate NUMERIC DEFAULT 0,
  ADD COLUMN origin TEXT DEFAULT '0',
  ADD COLUMN automatic_output TEXT DEFAULT 'none',
  ADD COLUMN sector TEXT,
  ADD COLUMN cost_center TEXT,
  ADD COLUMN max_stock NUMERIC DEFAULT 0,
  ADD COLUMN real_cost NUMERIC DEFAULT 0,
  ADD COLUMN average_cost NUMERIC DEFAULT 0,
  ADD COLUMN last_entry_date DATE,
  ADD COLUMN purchase_lot NUMERIC DEFAULT 0,
  ADD COLUMN current_balance NUMERIC DEFAULT 0,
  ADD COLUMN ean TEXT,
  ADD COLUMN ean_quantity NUMERIC DEFAULT 1,
  ADD COLUMN factory_code TEXT,
  ADD COLUMN observations TEXT;

-- Criar índices para busca
CREATE INDEX idx_pdv_ingredients_code ON public.pdv_ingredients(code);
CREATE INDEX idx_pdv_ingredients_ean ON public.pdv_ingredients(ean);
CREATE INDEX idx_pdv_ingredients_category ON public.pdv_ingredients(category);

-- Tabela de categorias/grupos de insumos
CREATE TABLE public.pdv_ingredient_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de setores
CREATE TABLE public.pdv_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de centros de custo
CREATE TABLE public.pdv_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.pdv_ingredient_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdv_cost_centers ENABLE ROW LEVEL SECURITY;

-- Policies para categorias
CREATE POLICY "Usuários podem gerenciar suas próprias categorias"
  ON public.pdv_ingredient_categories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies para setores
CREATE POLICY "Usuários podem gerenciar seus próprios setores"
  ON public.pdv_sectors
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies para centros de custo
CREATE POLICY "Usuários podem gerenciar seus próprios centros de custo"
  ON public.pdv_cost_centers
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);