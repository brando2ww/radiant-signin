-- Limpar códigos vazios existentes convertendo para NULL
UPDATE pdv_ingredients SET code = NULL WHERE code = '';

-- Remover a CONSTRAINT (não o index)
ALTER TABLE pdv_ingredients DROP CONSTRAINT IF EXISTS pdv_ingredients_code_key;

-- Criar index parcial que ignora valores nulos e escopa por usuário
CREATE UNIQUE INDEX pdv_ingredients_code_user_unique 
ON pdv_ingredients (code, user_id) 
WHERE code IS NOT NULL AND code != '';