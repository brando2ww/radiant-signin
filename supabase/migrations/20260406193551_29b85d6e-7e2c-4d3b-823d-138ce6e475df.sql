
-- delivery_loyalty_settings
CREATE TABLE public.delivery_loyalty_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_per_real NUMERIC NOT NULL DEFAULT 1,
  min_points_redeem INTEGER NOT NULL DEFAULT 50,
  cashback_value_per_point NUMERIC NOT NULL DEFAULT 0.10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_loyalty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage loyalty settings"
  ON public.delivery_loyalty_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_delivery_loyalty_settings_updated_at
  BEFORE UPDATE ON public.delivery_loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- delivery_loyalty_points
CREATE TABLE public.delivery_loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.delivery_customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view loyalty points"
  ON public.delivery_loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can insert loyalty points"
  ON public.delivery_loyalty_points FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view loyalty points"
  ON public.delivery_loyalty_points FOR SELECT
  USING (public.is_establishment_member(user_id));

-- delivery_loyalty_prizes
CREATE TABLE public.delivery_loyalty_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_quantity INTEGER,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_loyalty_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage loyalty prizes"
  ON public.delivery_loyalty_prizes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active loyalty prizes"
  ON public.delivery_loyalty_prizes FOR SELECT
  USING (is_active = true);

-- Index for fast balance lookups
CREATE INDEX idx_loyalty_points_customer ON public.delivery_loyalty_points(user_id, customer_id);
