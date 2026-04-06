
CREATE TABLE public.delivery_funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_funnel_events_user_date ON public.delivery_funnel_events (user_id, created_at);
CREATE INDEX idx_funnel_events_type ON public.delivery_funnel_events (event_type);

ALTER TABLE public.delivery_funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
  ON public.delivery_funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can view their funnel events"
  ON public.delivery_funnel_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
