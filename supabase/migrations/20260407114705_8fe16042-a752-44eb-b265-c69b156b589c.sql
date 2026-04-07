ALTER TABLE public.delivery_settings
ADD COLUMN covered_city JSONB DEFAULT NULL,
ADD COLUMN excluded_ceps JSONB DEFAULT '[]'::jsonb;