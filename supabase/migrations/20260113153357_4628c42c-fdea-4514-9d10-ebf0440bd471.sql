-- Adicionar coluna deleted_at em pdv_tables
ALTER TABLE pdv_tables ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Adicionar coluna deleted_at em pdv_sectors
ALTER TABLE pdv_sectors ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Atualizar itens já deletados (is_active = false) com a data de updated_at ou created_at
UPDATE pdv_tables SET deleted_at = COALESCE(updated_at, created_at) WHERE is_active = false AND deleted_at IS NULL;
UPDATE pdv_sectors SET deleted_at = created_at WHERE is_active = false AND deleted_at IS NULL;

-- Criar tabela de notificações do PDV
CREATE TABLE IF NOT EXISTS pdv_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Índice para buscar notificações por usuário
CREATE INDEX IF NOT EXISTS idx_pdv_notifications_user_id ON pdv_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pdv_notifications_read ON pdv_notifications(user_id, read);

-- RLS para notificações
ALTER TABLE pdv_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON pdv_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON pdv_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON pdv_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Função trigger para definir deleted_at quando is_active muda
CREATE OR REPLACE FUNCTION handle_soft_delete()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_active = false AND (OLD.is_active = true OR OLD.is_active IS NULL) THEN
    NEW.deleted_at = now();
  ELSIF NEW.is_active = true THEN
    NEW.deleted_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para pdv_tables e pdv_sectors
DROP TRIGGER IF EXISTS set_deleted_at_tables ON pdv_tables;
CREATE TRIGGER set_deleted_at_tables
  BEFORE UPDATE ON pdv_tables
  FOR EACH ROW EXECUTE FUNCTION handle_soft_delete();

DROP TRIGGER IF EXISTS set_deleted_at_sectors ON pdv_sectors;
CREATE TRIGGER set_deleted_at_sectors
  BEFORE UPDATE ON pdv_sectors
  FOR EACH ROW EXECUTE FUNCTION handle_soft_delete();