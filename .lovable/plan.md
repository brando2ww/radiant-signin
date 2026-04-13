

## Corrigir fluxo de ativação: separar "Pendente" de "Ativo"

### Problema
Atualmente o token é inserido com `is_active: true` no momento da geração. Isso faz o PDV mostrar "Ativo" imediatamente, antes do outro sistema (maquininha) consumir/validar o token. O status deveria ser "Pendente" até a maquininha confirmar.

### Solução
Usar `is_active: false` na geração do token. O outro sistema, ao validar o token, fará `UPDATE ... SET is_active = true, activated_at = now()`. O PDV exibe 3 estados:

1. **Sem token** — botão "Gerar código de ativação"
2. **Token gerado, pendente** (`is_active = false`) — exibe token com botão Copiar + badge "Pendente de ativação" (amarelo) + botão "Verificar status"
3. **Ativado** (`is_active = true`) — badge "Ativo" (verde) + dados de ativação

### Alterações

**`src/components/pdv/integrations/DeviceActivationCard.tsx`**
- No `handleGenerateToken`: mudar `is_active: true` para `is_active: false` e remover `activated_at`
- No `checkExistingDevice`: buscar qualquer registro do user (remover filtro `is_active = true`), ordenar por criação desc, pegar o mais recente
- Adicionar estado intermediário "Pendente": badge amarelo, exibe token + Copiar + instrução, botão "Verificar status" que re-busca o registro
- Manter estado "Ativo" quando `is_active = true` (confirmado pela maquininha)

### Fluxo visual

```text
Sem token          → [Gerar código]
Token pendente     → Badge "Pendente" (amarelo) + token + Copiar + [Verificar status]  
Token ativo        → Badge "Ativo" (verde) + dados de ativação
```

### Arquivo alterado
1. `src/components/pdv/integrations/DeviceActivationCard.tsx`

