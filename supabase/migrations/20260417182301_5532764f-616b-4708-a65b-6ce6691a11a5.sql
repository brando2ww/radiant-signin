-- Tabela de Centros de Produção (estações de cozinha/bar/etc configuráveis)
CREATE TABLE public.pdv_production_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  icon text NOT NULL DEFAULT 'ChefHat',
  printer_name text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Index for faster lookups
CREATE INDEX idx_pdv_production_centers_user ON public.pdv_production_centers(user_id, is_active, display_order);

-- Enable RLS
ALTER TABLE public.pdv_production_centers ENABLE ROW LEVEL SECURITY;

-- RLS: owner can do anything
CREATE POLICY "Owners manage their production centers"
ON public.pdv_production_centers
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS: establishment members can SELECT
CREATE POLICY "Establishment members can view production centers"
ON public.pdv_production_centers
FOR SELECT
USING (public.is_establishment_member(user_id));

-- Trigger to update updated_at
CREATE TRIGGER update_pdv_production_centers_updated_at
BEFORE UPDATE ON public.pdv_production_centers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Seed: cria os 4 centros padrão para todos os usuários que já têm produtos com printer_station
INSERT INTO public.pdv_production_centers (user_id, name, slug, color, icon, display_order)
SELECT DISTINCT p.user_id, 'Cozinha', 'cozinha', '#ef4444', 'ChefHat', 0
FROM public.pdv_products p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO public.pdv_production_centers (user_id, name, slug, color, icon, display_order)
SELECT DISTINCT p.user_id, 'Bar', 'bar', '#8b5cf6', 'Wine', 1
FROM public.pdv_products p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO public.pdv_production_centers (user_id, name, slug, color, icon, display_order)
SELECT DISTINCT p.user_id, 'Copa', 'copa', '#06b6d4', 'Coffee', 2
FROM public.pdv_products p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO public.pdv_production_centers (user_id, name, slug, color, icon, display_order)
SELECT DISTINCT p.user_id, 'Confeitaria', 'confeitaria', '#ec4899', 'Cake', 3
FROM public.pdv_products p
WHERE p.user_id IS NOT NULL
ON CONFLICT (user_id, slug) DO NOTHING;