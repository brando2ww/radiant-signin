-- Create table for 2FA codes
CREATE TABLE public.two_factor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.two_factor_codes ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own codes
CREATE POLICY "Users can read own 2fa codes" ON public.two_factor_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_two_factor_codes_user_id ON public.two_factor_codes(user_id);
CREATE INDEX idx_two_factor_codes_expires_at ON public.two_factor_codes(expires_at);