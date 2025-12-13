-- Create table for WhatsApp verifications
CREATE TABLE public.whatsapp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.whatsapp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own verifications
CREATE POLICY "Users can view their own verifications"
ON public.whatsapp_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own verifications
CREATE POLICY "Users can create their own verifications"
ON public.whatsapp_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own verifications
CREATE POLICY "Users can update their own verifications"
ON public.whatsapp_verifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own verifications
CREATE POLICY "Users can delete their own verifications"
ON public.whatsapp_verifications
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_whatsapp_verifications_user_phone 
ON public.whatsapp_verifications(user_id, phone_number);

CREATE INDEX idx_whatsapp_verifications_code 
ON public.whatsapp_verifications(verification_code, expires_at);