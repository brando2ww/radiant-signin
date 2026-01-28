-- Add connection_name column to whatsapp_connections
ALTER TABLE public.whatsapp_connections 
ADD COLUMN IF NOT EXISTS connection_name text;