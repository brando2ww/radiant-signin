-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language text DEFAULT 'pt-BR',
  date_format text DEFAULT 'DD/MM/YYYY',
  time_format text DEFAULT '24h',
  timezone text DEFAULT 'America/Sao_Paulo',
  currency text DEFAULT 'BRL',
  theme text DEFAULT 'system',
  density text DEFAULT 'normal',
  sidebar_expanded boolean DEFAULT false,
  notifications jsonb DEFAULT '{"transactions": {"new_income": true, "new_expense": true, "edited": false, "daily_summary": true}, "credit_cards": {"due_date_days": 3, "limit_percentage": 80, "invoice_closed": true}, "tasks": {"reminder_minutes": 30, "events": true, "overdue": true}, "reports": {"weekly": false, "monthly": true, "trends": true}}'::jsonb,
  financial_settings jsonb DEFAULT '{"default_payment_method": "credit_card", "budget_alert_percentage": 80, "rounding": "nearest", "credit_card_due_day": 10, "credit_card_closing_day": 5, "monthly_budget": 0}'::jsonb,
  security_settings jsonb DEFAULT '{"two_factor_enabled": false, "auto_logout_minutes": 30, "hide_values": false, "require_password_sensitive": true}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias configurações"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();