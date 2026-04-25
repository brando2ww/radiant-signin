## Distinguir itens "rascunho" de itens enviados na tela do garçom

### Problema atual

Na `GarcomComandaDetalhe`, todos os itens da comanda aparecem misturados no mesmo bloco. O `ComandaItemCard` mostra um badge "Pendente" / "Enviado" / "Preparando", mas:

- Itens **não enviados ainda** (rascunho do garçom) e itens **já enviados para a cozinha** vivem na mesma lista, lado a lado, com o mesmo botão de remover.
- Não fica visualmente claro o que ainda pode ser editado livremente vs. o que já está em produção.
- Faltam controles de **quantidade** (− / +) nos itens rascunho — hoje, para mudar de "1× X-Burguer" para "2× X-Burguer", o garçom precisa apagar e adicionar de novo.
- O botão de remover de itens já enviados também não passa por confirmação/motivo (lacuna separada que esta task **não** corrige — apenas vai esconder o botão para itens enviados, deixando o fluxo "remover após envio" para um momento futuro com confirmação dedicada).

### Onde mexer

- `src/pages/garcom/GarcomComandaDetalhe.tsx` — separar a lista em dois grupos.
- `src/pages/garcom/GarcomMesaDetalhe.tsx` — mesmo agrupamento (a mesa também lista itens das comandas).
- `src/components/garcom/ComandaItemCard.tsx` — adicionar suporte a controles de quantidade (− / +) e variante "rascunho" / "enviado" (visual + permissões).

Sem mudanças em hooks ou banco — `updateItem({ id, quantity })` e `removeItem(id)` já existem em `usePDVComandas` e o segundo já é instantâneo (sem confirm).

### Como vai funcionar

**Critério de "rascunho":** `kitchen_status === "pendente" && !sent_to_kitchen_at`. Mesmo critério já usado para listar `pendingIds` ao enviar para cozinha.

#### Layout em 2 grupos na `GarcomComandaDetalhe`

```text
┌─ Novos itens — não enviados ainda ──────────┐
│                                              │
│  [ 2× ] X-Burguer            R$ 64,00        │
│         [ − ] 2 [ + ]                  [🗑]  │
│                                              │
│  [ 1× ] Coca-Cola lata       R$  8,00        │
│         [ − ] 1 [ + ]                  [🗑]  │
└──────────────────────────────────────────────┘

┌─ Já enviados para a cozinha ────────────────┐
│                                              │
│  [ 1× ] Batata G        Preparando  R$ 30,00 │
│  [ 2× ] Suco            Pronto      R$ 24,00 │
│                                              │
└──────────────────────────────────────────────┘
```

Regras de cada grupo:

- **Novos itens — não enviados ainda**
  - Header com label clara + contagem.
  - Cada card: nome, observações, controles `− N +`, botão lixeira sempre visível.
  - Tocar lixeira → remoção imediata, sem `AlertDialog`, sem motivo.
  - Tocar `−` quando `quantity === 1` → remove o item (mesmo efeito de lixeira).
  - Tocar `+` ou `−` (acima de 1) → chama `updateItem({ id, quantity: novaQty })`.
  - Subtotal e barra fixa de "Total" recalculam por React Query (já acontece hoje).
  - Sem badge de status (são todos "Pendente" implícito) — o próprio header do grupo já comunica.

- **Já enviados para a cozinha**
  - Header com label clara + contagem.
  - Cada card: somente leitura — mantém badge `Preparando`/`Pronto`/`Entregue`/`Enviado`, mas **sem** controles de quantidade e **sem** botão lixeira nem botão "Mover" no fluxo padrão.
  - Visual ligeiramente esmaecido (`opacity-90 bg-muted/30`) para reforçar que é histórico em produção.
  - O botão "Mover" (transferência) **continua disponível** apenas dentro do `selectMode` (modo seleção do header) — ele é caso de correção operacional separado e já implementado.

- Se a comanda estiver em `aguardando_pagamento` / `em_cobranca` / `fechada` (`!canEdit`): nenhum dos grupos exibe controles de edição (igual hoje).

- Se algum dos grupos estiver vazio, o cabeçalho dele não é renderizado.

#### `GarcomMesaDetalhe`

A mesa também renderiza `ComandaItemCard` por comanda. Aplicar o mesmo agrupamento dentro de cada bloco de comanda (mesmo padrão: rascunho primeiro, enviados depois, com headers claros) — mantém consistência entre as duas telas.

#### `ComandaItemCard` — nova prop e variante

- Adicionar props:
  ```ts
  variant?: "draft" | "sent";          // default "sent" (compat)
  onIncrement?: () => void;
  onDecrement?: () => void;
  ```
- Quando `variant === "draft"`:
  - Renderizar a linha de controles `[ − ] qty [ + ]` abaixo do nome.
  - Esconder o badge de `kitchen_status` (redundante — o header do grupo já informa).
  - `onRemove` aparece sempre (sem `selectMode` necessário) com lixeira maior (`h-9 w-9` e `Trash2 h-4 w-4`) — touch-friendly em tablet.
- Quando `variant === "sent"`:
  - Comportamento atual (badge visível, lixeira só fora de `selectMode` se `onRemove` for passado). Para honrar a regra "remoção depois do envio exige fluxo separado", a `GarcomComandaDetalhe`/`GarcomMesaDetalhe` **não** vão passar `onRemove` para itens enviados — botão simplesmente não aparece. (Quando o fluxo dedicado de remoção pós-envio com motivo existir, é só voltar a passar `onRemove` mais um `confirm` por cima.)
- Manter compatibilidade: `selectMode` continua funcionando em ambas as variantes — o header do `GarcomComandaDetalhe` continua oferecendo "Selecionar" para mover.

#### Detalhe de UX

- Header de cada grupo: pequeno, em uppercase / `text-xs font-semibold text-muted-foreground`, com um ícone discreto (`Pencil` para rascunho, `ChefHat` ou `CheckCircle` para enviados) e contador `(N)` ao lado.
- Espaçamento `space-y-2` dentro dos grupos, `space-y-4` entre grupos.
- Total na barra inferior continua somando tudo (rascunho + enviado) — comportamento atual preservado.

### Detalhes técnicos

`GarcomComandaDetalhe.tsx`:

```tsx
const { updateItem, isUpdatingItem } = usePDVComandas(); // já existe
const draftItems = items.filter(i => i.kitchen_status === "pendente" && !i.sent_to_kitchen_at);
const sentItems  = items.filter(i => !(i.kitchen_status === "pendente" && !i.sent_to_kitchen_at));

const handleIncrement = (item) => updateItem({ id: item.id, quantity: item.quantity + 1 });
const handleDecrement = (item) => {
  if (item.quantity <= 1) removeItem(item.id);
  else updateItem({ id: item.id, quantity: item.quantity - 1 });
};
```

Renderizar dois `<section>` quando `canEdit && !selectMode` para o grupo draft (controles ativos), e um `<section>` somente leitura para o grupo sent. Em `selectMode`, manter lista única (a seleção pode atravessar os dois grupos sem problema, já que só "Mover" usa isso).

Aplicar o mesmo padrão em `GarcomMesaDetalhe.tsx` dentro de cada bloco de comanda.

### Validação

- Adicionar 2 itens no `GarcomAdicionarItem` → voltar para detalhe da comanda → ambos aparecem em "Novos itens".
- `+` em um deles → quantidade vai pra 2, subtotal e total recalculam ao vivo.
- `−` até 1 → continua 1. Mais um `−` → item some sem confirmação.
- Lixeira → some imediato.
- Tocar "Cozinha" → itens viram grupo "Já enviados", sem controles, com badge correto.
- Adicionar mais um item depois → ele aparece em "Novos itens", separado dos enviados.
- Toggle "Selecionar" no header → ambos os grupos viram seleção plana, "Mover" funciona em qualquer item.
- Comanda em `aguardando_pagamento` → nenhum controle de edição visível, apenas a lista somente-leitura.
- Mesma experiência em `GarcomMesaDetalhe`.
