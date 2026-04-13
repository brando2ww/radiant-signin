

## Corrigir tabela `pdv_device_config` e código do componente

### Problema atual na tabela
- `activated_at` tem default `now()` e NOT NULL — sempre preenche ao inserir
- `is_active` tem default `true` — ignora o `false` do código
- Não existe coluna `created_at` — causa erro no `order("created_at")`

### Migration SQL

```sql
-- Adicionar created_at
ALTER TABLE pdv_device_config 
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

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
```

### Código (`DeviceActivationCard.tsx`)
O código já está correto para o novo schema — insere com `is_active: false` sem `activated_at`, e ordena por `created_at`. Nenhuma alteração de código necessária após a migration.

### Arquivos alterados
1. **Nova migration SQL** — corrige schema da tabela `pdv_device_config`

