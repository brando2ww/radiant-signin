
-- Add roulette_enabled to evaluation_campaigns
ALTER TABLE public.evaluation_campaigns ADD COLUMN IF NOT EXISTS roulette_enabled boolean NOT NULL DEFAULT false;

-- Campaign prizes
CREATE TABLE public.campaign_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  probability numeric NOT NULL DEFAULT 0,
  max_quantity int,
  redeemed_count int NOT NULL DEFAULT 0,
  coupon_validity_days int NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_prizes ENABLE ROW LEVEL SECURITY;

-- Public SELECT for prizes (roulette works without auth)
CREATE POLICY "Anyone can read active prizes" ON public.campaign_prizes FOR SELECT USING (true);
-- Owner can manage
CREATE POLICY "Owner can insert prizes" ON public.campaign_prizes FOR INSERT TO authenticated
  WITH CHECK (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Owner can update prizes" ON public.campaign_prizes FOR UPDATE TO authenticated
  USING (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Owner can delete prizes" ON public.campaign_prizes FOR DELETE TO authenticated
  USING (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()));

-- Campaign prize wins
CREATE TABLE public.campaign_prize_wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  prize_id uuid NOT NULL REFERENCES public.campaign_prizes(id) ON DELETE CASCADE,
  evaluation_id uuid NOT NULL REFERENCES public.customer_evaluations(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_whatsapp text NOT NULL,
  coupon_code text NOT NULL UNIQUE,
  coupon_expires_at timestamptz NOT NULL,
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_spin_per_evaluation UNIQUE (evaluation_id)
);

ALTER TABLE public.campaign_prize_wins ENABLE ROW LEVEL SECURITY;

-- Public can read own wins and insert (no auth needed for public evaluation)
CREATE POLICY "Anyone can read wins" ON public.campaign_prize_wins FOR SELECT USING (true);
CREATE POLICY "Anyone can insert wins" ON public.campaign_prize_wins FOR INSERT WITH CHECK (true);
-- Owner can update (mark as redeemed)
CREATE POLICY "Owner can update wins" ON public.campaign_prize_wins FOR UPDATE TO authenticated
  USING (campaign_id IN (SELECT id FROM public.evaluation_campaigns WHERE user_id = auth.uid()));
