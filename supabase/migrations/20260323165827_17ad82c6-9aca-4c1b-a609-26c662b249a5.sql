ALTER TABLE public.operational_task_settings
ADD COLUMN IF NOT EXISTS whatsapp_report_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_report_phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_report_time TEXT DEFAULT '23:00';