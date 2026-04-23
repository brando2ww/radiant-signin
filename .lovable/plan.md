

## Envio para cozinha: redirecionar para mesas + badge "Enviado"

### Mudanças

**1. `src/components/garcom/ComandaItemCard.tsx`** — badge passa a refletir se o item já foi para cozinha
- Aceitar nova prop opcional `sentToKitchenAt: string | null`.
- Se `kitchen_status === "pendente"` **e** `sent_to_kitchen_at != null`, exibir badge **"Enviado"** (cor azul claro, ex: `bg-sky-100 text-sky-800`) em vez de "Pendente" cinza.
- Demais status (`preparando`, `pronto`, `entregue`) continuam iguais.

**2. `src/pages/garcom/GarcomComandaDetalhe.tsx`** — passa o novo prop e redireciona após envio
- No `<ComandaItemCard>` (linha ~163), adicionar `sentToKitchenAt={item.sent_to_kitchen_at}`.
- No botão "Cozinha" (linha ~189), envolver `sendToKitchen` em handler async que aguarda a mutation e em seguida `navigate("/garcom")`.
  - Como `sendToKitchen` hoje é `mutate` (fire-and-forget), expor também `sendToKitchenAsync` em `usePDVComandas` e usá-lo aqui para garantir ordem (toast → redirect).

**3. `src/pages/garcom/GarcomAdicionarItem.tsx`** — mesmo redirect ao usar a barra "Enviar para Cozinha"
- Em `handleSendToKitchen` (linha 36), trocar para `await sendToKitchenAsync(...)` seguido de `navigate("/garcom")`.

**4. `src/hooks/use-pdv-comandas.ts`** — exportar versão async da mutation
- No retorno do hook, adicionar `sendToKitchenAsync: sendToKitchenMutation.mutateAsync` ao lado do `sendToKitchen` existente. Sem alterar a lógica do mutation (status no banco continua `"pendente"` + `sent_to_kitchen_at` preenchido — coerente com o fluxo da cozinha).

### Por que não mudar `kitchen_status` no banco

Manter `kitchen_status = "pendente"` preserva o significado para a tela da Cozinha (`KitchenItemCard`, `usePDVKitchen`): o cozinheiro ainda precisa clicar "Iniciar Preparo" para virar `preparando`. A diferença "recebido pela cozinha" vs. "ainda no garçom sem enviar" continua representada pelo timestamp `sent_to_kitchen_at`, que já é populado pelo `sendToKitchenMutation`. A mudança é puramente visual no app do garçom.

### Validação

- Adicionar item numa comanda → badge mostra **"Pendente"** (cinza).
- Clicar "Cozinha" → toast "Itens enviados para cozinha!" → redireciona para `/garcom` (lista de mesas).
- Reabrir a comanda → itens recém-enviados aparecem com badge **"Enviado"** (azul).
- Tela `/pdv/cozinha` continua mostrando o item como "Pendente" até o cozinheiro iniciar o preparo (sem regressão).
- Funciona tanto pelo botão "Cozinha" do detalhe da comanda quanto pela barra inferior em "Adicionar Item".

