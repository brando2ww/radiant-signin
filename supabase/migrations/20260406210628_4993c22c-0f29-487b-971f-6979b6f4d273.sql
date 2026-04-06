ALTER TABLE public.evaluation_campaigns
ADD COLUMN wheel_primary_color TEXT DEFAULT '#1a1a2e',
ADD COLUMN wheel_secondary_color TEXT DEFAULT '#722F37',
ADD COLUMN roulette_cooldown_hours INTEGER DEFAULT 0;