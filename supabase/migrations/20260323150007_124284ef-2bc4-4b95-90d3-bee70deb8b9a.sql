
CREATE OR REPLACE FUNCTION public.increment_prize_redeemed_count(prize_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.campaign_prizes
  SET redeemed_count = redeemed_count + 1
  WHERE id = prize_id;
$$;
