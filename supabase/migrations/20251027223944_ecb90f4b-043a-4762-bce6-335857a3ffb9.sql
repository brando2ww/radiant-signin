-- Adicionar campos específicos do iFood na tabela pdv_settings
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_merchant_id TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_access_token TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_refresh_token TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_enabled BOOLEAN DEFAULT false;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_auto_accept BOOLEAN DEFAULT false;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS ifood_sync_menu BOOLEAN DEFAULT true;

-- Criar tabela de mapeamento de produtos iFood
CREATE TABLE IF NOT EXISTS pdv_ifood_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pdv_product_id UUID REFERENCES pdv_products(id) ON DELETE CASCADE,
  ifood_product_id TEXT,
  ifood_sku TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ifood_products_user ON pdv_ifood_products(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_products_pdv_product ON pdv_ifood_products(pdv_product_id);
CREATE INDEX IF NOT EXISTS idx_ifood_products_ifood_id ON pdv_ifood_products(ifood_product_id);

-- Criar tabela de logs de sincronização
CREATE TABLE IF NOT EXISTS pdv_ifood_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para logs
CREATE INDEX IF NOT EXISTS idx_ifood_sync_logs_user ON pdv_ifood_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_sync_logs_created ON pdv_ifood_sync_logs(created_at DESC);

-- Criar tabela de webhooks do iFood
CREATE TABLE IF NOT EXISTS pdv_ifood_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  pdv_order_id UUID REFERENCES pdv_orders(id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para webhooks
CREATE INDEX IF NOT EXISTS idx_ifood_webhooks_user ON pdv_ifood_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_ifood_webhooks_processed ON pdv_ifood_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_ifood_webhooks_event_id ON pdv_ifood_webhooks(event_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE pdv_ifood_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdv_ifood_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdv_ifood_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pdv_ifood_products
CREATE POLICY "Usuários podem gerenciar seus produtos iFood"
  ON pdv_ifood_products
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para pdv_ifood_sync_logs
CREATE POLICY "Usuários podem ver seus logs de sincronização"
  ON pdv_ifood_sync_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar logs de sincronização"
  ON pdv_ifood_sync_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para pdv_ifood_webhooks
CREATE POLICY "Usuários podem ver seus webhooks"
  ON pdv_ifood_webhooks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar webhooks"
  ON pdv_ifood_webhooks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar webhooks"
  ON pdv_ifood_webhooks
  FOR UPDATE
  USING (true);

-- Comentários para documentação
COMMENT ON TABLE pdv_ifood_products IS 'Mapeamento entre produtos do PDV e produtos do iFood';
COMMENT ON TABLE pdv_ifood_sync_logs IS 'Histórico de sincronizações com o iFood';
COMMENT ON TABLE pdv_ifood_webhooks IS 'Eventos recebidos via webhook do iFood';

COMMENT ON COLUMN pdv_settings.ifood_access_token IS 'Token de acesso OAuth do iFood (criptografado)';
COMMENT ON COLUMN pdv_settings.ifood_refresh_token IS 'Token de refresh OAuth do iFood (criptografado)';
COMMENT ON COLUMN pdv_settings.ifood_enabled IS 'Se a integração com iFood está ativa';
COMMENT ON COLUMN pdv_settings.ifood_auto_accept IS 'Se deve aceitar pedidos do iFood automaticamente';