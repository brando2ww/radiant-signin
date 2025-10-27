-- Expandir tabela pdv_settings com novos campos

-- Configurações Gerais
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS business_cnpj TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS state_registration TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS tax_regime TEXT DEFAULT 'simples_nacional';

-- Horários de Funcionamento
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00", "is_closed": false}, "tuesday": {"open": "08:00", "close": "18:00", "is_closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "is_closed": false}, "thursday": {"open": "08:00", "close": "18:00", "is_closed": false}, "friday": {"open": "08:00", "close": "18:00", "is_closed": false}, "saturday": {"open": "08:00", "close": "14:00", "is_closed": false}, "sunday": {"open": "08:00", "close": "14:00", "is_closed": true}}'::jsonb;

-- Configurações de Pedidos
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS default_preparation_time INTEGER DEFAULT 30;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS accept_tips BOOLEAN DEFAULT true;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS min_order_value NUMERIC DEFAULT 0;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS max_tables_per_order INTEGER DEFAULT 10;

-- Configurações de Pagamento
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS accepted_payment_methods JSONB DEFAULT '[{"method": "cash", "enabled": true, "fee_percentage": 0}, {"method": "credit", "enabled": true, "fee_percentage": 0}, {"method": "debit", "enabled": true, "fee_percentage": 0}, {"method": "pix", "enabled": true, "fee_percentage": 0}]'::jsonb;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS enable_multiple_payments BOOLEAN DEFAULT true;

-- Impressoras
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS printers JSONB DEFAULT '[]'::jsonb;

-- Notificações
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS enable_sound_notifications BOOLEAN DEFAULT true;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS new_order_sound TEXT DEFAULT 'default';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS order_ready_sound TEXT DEFAULT 'default';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS enable_desktop_notifications BOOLEAN DEFAULT true;

-- Comentários para documentação
COMMENT ON COLUMN pdv_settings.business_hours IS 'Horários de funcionamento por dia da semana';
COMMENT ON COLUMN pdv_settings.accepted_payment_methods IS 'Lista de métodos de pagamento aceitos com taxas';
COMMENT ON COLUMN pdv_settings.printers IS 'Configurações de impressoras por setor (kitchen, bar, cashier)';
COMMENT ON COLUMN pdv_settings.tax_regime IS 'Regime tributário: simples_nacional, lucro_presumido, lucro_real';