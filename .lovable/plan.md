

## Tela "Ativar Maquininha" nas Integrações do PDV

### O que será feito
Criar uma nova integração "Ativar Dispositivo" no hub de integrações, onde o usuário cola o token de 12 caracteres gerado no outro sistema. O PDV valida o token na tabela `pdv_device_config` (já existente no banco), confirma a ativação e exibe o status.

### Tabela existente
A tabela `pdv_device_config` já existe com colunas: `id`, `user_id`, `activation_token`, `activated_at`, `is_active`. Não precisa de migração.

### Arquivos

**1. Novo: `src/components/pdv/integrations/DeviceActivationCard.tsx`**
- Card com campo de input para colar o token (12 caracteres, uppercase)
- Botão "Validar Token" que busca na tabela `pdv_device_config` onde `activation_token = token` e `is_active = true`
- Se encontrado: exibe status "Ativado" com dados (token, data de ativação, user_id vinculado)
- Se não encontrado: exibe erro "Token inválido ou inexistente"
- Ao carregar, verifica se o usuário logado já possui um dispositivo ativo (busca por `user_id = auth.uid()`) e exibe o status
- Badge de status: Ativo (verde) / Não configurado (cinza)

**2. Editar: `src/pages/pdv/IntegrationsHub.tsx`**
- Adicionar item "Ativar Dispositivo" na lista de integrações com categoria "Dispositivo" e ícone `TabletSmartphone`

**3. Editar: `src/pages/pdv/IntegrationDetail.tsx`**
- Adicionar entrada `"ativar-dispositivo"` no objeto `integrations` com features, steps e o componente `DeviceActivationCard`

**4. Editar: `src/integrations/supabase/types.ts`**
- Não pode ser editado diretamente. Usaremos `.from('pdv_device_config' as any)` para queries até os tipos serem regenerados.

### Fluxo do usuário
1. Acessa Integrações → Ativar Dispositivo
2. Cola o token de 12 caracteres
3. Clica "Validar Token"
4. Sistema busca na `pdv_device_config` e confirma se é válido
5. Exibe status verde "Dispositivo Ativo" com detalhes

