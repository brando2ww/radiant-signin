-- Adicionar created_at
ALTER TABLE pdv_device_config 
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Tornar activated_at nullable com default null
ALTER TABLE pdv_device_config 
  ALTER COLUMN activated_at DROP NOT NULL,
  ALTER COLUMN activated_at SET DEFAULT NULL;

-- Mudar default de is_active para false
ALTER TABLE pdv_device_config 
  ALTER COLUMN is_active SET DEFAULT false;

-- Corrigir registros existentes que foram criados com defaults errados
UPDATE pdv_device_config 
  SET activated_at = NULL, is_active = false 
  WHERE activated_at IS NOT NULL AND is_active = true;