
## Pagamento parcial por seleção de itens

Adicionar uma nova modalidade de cobrança no `PaymentDialog` que permite selecionar itens específicos (e quantidades parciais) para pagar agora, mantendo o restante pendente na comanda até liquidação total.

---

### Observação importante sobre o estado atual

O dialog hoje tem apenas **dois modos**: "Pagar tudo (forma única)" e "Dividir pagamento (várias formas para o mesmo total)". Não existem ainda "dividir igualmente" nem "dividir por pessoa". Vamos introduzir um **seletor de modo de cobrança** com 3 opções iniciais e a nova quarta opção:

```text
[ Tudo ]  [ Várias formas ]  [ Por produto (NOVO) ]
```

(Os dois modos antigos ficam preservados; "dividir igualmente / por pessoa" pode ser feito num próximo passo.)

---

### Fluxo da nova opção "Por produto"

**Passo 1 — Seleção**
- A lista do "Resumo do pedido" passa a renderizar checkbox grande à esquerda de cada linha.
- Itens já marcados como `pago` aparecem riscados, esmaecidos, sem checkbox.
- Itens em `em_cobranca` por outra sessão paralela aparecem com cadeado e badge "em cobrança", desabilitados.
- Para `quantity > 1`, mostrar stepper "1 / 3" ao lado do checkbox para escolher quantas unidades pagar agora (default = restante não-pago).
- Atalhos: "Selecionar todos pendentes" e "Limpar seleção".
- Subtotal da seleção atualiza em tempo real e aparece num **rodapé sticky** com:
  `X de Y itens — R$ XX,XX selecionado`
  Botão "Cobrar seleção".

**Passo 2 — Confirmar e pagar**
- Ao clicar "Cobrar seleção", o painel direito do dialog passa a operar sobre o **subtotal da seleção** (não o subtotal total).
- Desconto e taxa de serviço são calculados **proporcionalmente** sobre a fração selecionada.
- Card destacado mostra:
  - "Cobrando agora": lista resumida dos itens/qtds selecionados + total
  - "Fica em aberto": contagem + total restante após o pagamento
- Forma de pagamento (dinheiro/cartão/pix) e troco funcionam normalmente.

**Passo 3 — Após confirmar**
- Itens 100% pagos: marcados como `pago` (visualmente riscados na próxima abertura).
- Itens parcialmente pagos (qtd parcial): permanecem na lista com indicador "1 de 3 pago" e podem ser cobrados de novo depois.
- A comanda **permanece aberta** (status volta de `em_cobranca` → `aguardando_pagamento` ou `aberta` conforme origem) enquanto houver qtd pendente.
- Quando a última unidade pendente for paga, a comanda fecha automaticamente e a mesa libera (lógica já existente em `registerPayment`).
- Cada pagamento parcial é gravado individualmente em `pdv_payments` + tabela de auditoria `pdv_payment_items` com (item_id, qty_paga, valor).

---

### Mudanças técnicas

**Schema (migration)**

1. `pdv_comanda_items`: adicionar colunas
   - `paid_quantity integer NOT NULL DEFAULT 0`
   - `fully_paid boolean GENERATED ALWAYS AS (paid_quantity >= quantity) STORED` (ou coluna comum + trigger)
   - índice em `(comanda_id, fully_paid)` para queries rápidas

2. Nova tabela `pdv_payment_items`:
   - `id uuid pk`, `payment_id uuid → pdv_payments.id ON DELETE CASCADE`
   - `comanda_item_id uuid → pdv_comanda_items.id`
   - `quantity_paid integer`, `unit_price numeric`, `subtotal_paid numeric`
   - `created_at`
   - RLS espelhando a do `pdv_payments`

3. Trigger `update_comanda_subtotal`: ajustar para considerar **subtotal pendente** = `SUM(unit_price * (quantity - paid_quantity))`. Manter `subtotal` original e adicionar `pending_subtotal` em `pdv_comandas`, OU recalcular `subtotal` para refletir só o pendente — **vamos manter `subtotal` como total bruto** (não muda) e **adicionar `pending_subtotal numeric` em `pdv_comandas`** atualizado pelo trigger. Isto evita quebrar relatórios.

4. Bloqueio de seleção concorrente: nova tabela leve `pdv_comanda_item_locks` (item_id, locked_by, locked_at, expires_at) com TTL curto (~5 min), checada na UI e no momento do pagamento. Alternativa mais simples: gravar `charging_session_id` na própria linha de item — preferimos esta para reduzir superfície.
   - Adicionar `charging_session_id uuid NULL` em `pdv_comanda_items` + função RPC `lock_comanda_items(item_ids[])` que faz update atômico só se `charging_session_id IS NULL`.

**Hook `usePDVPayments`**

- Estender `RegisterPaymentParams` com campo opcional `partialItems?: { itemId, quantityPaid }[]`.
- Quando presente:
  - **NÃO** fechar a comanda automaticamente.
  - Atualizar `paid_quantity` de cada item (incrementando, não substituindo).
  - Inserir linhas em `pdv_payment_items`.
  - Liberar `charging_session_id` dos itens cobrados.
  - Após o update, verificar se todos os itens têm `fully_paid = true`; se sim, executar a finalização normal (fechar comanda, liberar mesa, fechar order).
- Inserir movimento de caixa com descrição `"Comanda #X — pagamento parcial"`.
- Disparar `logActivityDirect` com action `comanda_partial_payment` contendo lista de itens cobertos.

**Hook `usePDVComandas`**

- Filtrar `liveComandaItems` para incluir `paid_quantity` e flags. Já carregado pela query — basta o tipo.
- Nova mutation `lockItemsForCharging(itemIds[])` / `unlockItems(itemIds[])` chamando RPC.

**Componente `PaymentDialog`**

- Novo state:
  ```ts
  type ChargeMode = "all" | "split-forms" | "by-product";
  const [chargeMode, setChargeMode] = useState<ChargeMode>("all");
  const [selectedItemQtys, setSelectedItemQtys] = useState<Map<string, number>>(new Map());
  const [byProductStep, setByProductStep] = useState<"select" | "confirm">("select");
  ```
- Trocar o atual `Switch "Dividir pagamento"` por um **segmented control** com 3 modos no topo da coluna direita.
- `subtotal` efetivo passa a ser derivado:
  - `all` / `split-forms`: comportamento atual (soma de displayItems pendentes)
  - `by-product`: soma de `unit_price * selectedQty` para cada itemId selecionado
- Desconto/taxa: a fração `selectedSubtotal / fullSubtotal` é aplicada aos valores absolutos (mantém percent natural).
- Ao confirmar pagamento `by-product`: chamar `registerPayment({ ..., partialItems })`.
- Ao abrir o modo "by-product", chamar `lockItemsForCharging` para os itens visíveis (ou só ao marcar checkbox — preferível: lock no momento do clique, unlock no desmarcar).
- Ao fechar o dialog sem concluir: liberar todos os locks adquiridos.
- Itens com `paid_quantity > 0` mostrar badge "Pago: 1/3", `paid_quantity === quantity` mostrar riscado e cinza.

**Lista de itens fora do PaymentDialog**

- `ComandaItemCard.tsx`, `ComandaDetailsDialog.tsx`, `GarcomComandaDetalhe.tsx`: aplicar o mesmo tratamento visual (riscado / "X/Y pago") para refletir consistência.

**Validações**

- Não confirmar com 0 itens selecionados (botão desabilitado).
- Se outro caixa pegou um item entre a seleção e a confirmação, exibir toast e remover da seleção (conflito otimista).
- Comanda em status `fechada` ou `cancelada`: modo "by-product" indisponível.

---

### Estrutura de UI (modo by-product, mobile-friendly p/ tablet)

```text
┌─ Pagamento - Mesa 5 ────────────────── X ─┐
│ [ Tudo ] [ Várias formas ] [Por produto▣]│
│                                            │
│  Resumo do Pedido                          │
│  ┌──────────────────────────────────────┐ │
│  │ ☐  3x Refrigerante  [2/3]  R$ 18,00 │ │
│  │ ☑  1x X-Burger              R$ 28,00│ │
│  │ ━━ 1x Suco (PAGO) ━━━━━━━━ R$ 8,00 │ │
│  │ 🔒 1x Sobremesa (em cobrança)       │ │
│  └──────────────────────────────────────┘ │
│  [Selecionar todos]  [Limpar]              │
│                                            │
│  ─── Cobrando agora ─────────────          │
│  • 2x Refrigerante      R$ 12,00           │
│  • 1x X-Burger          R$ 28,00           │
│  Subtotal selecionado:  R$ 40,00           │
│  Taxa serviço (10%):    R$  4,00           │
│  TOTAL A COBRAR:        R$ 44,00           │
│                                            │
│  Fica em aberto: 2 itens — R$ 26,00        │
│                                            │
│  [Forma de pagamento ...]                  │
│                                            │
│  [Cancelar]            [Cobrar R$ 44,00]   │
└────────────────────────────────────────────┘
```

---

### Validação manual

- Comanda com 3 itens; selecionar 1 → cobrar → dialog mostra "concluído", reabrir comanda → 2 itens visíveis, 1 riscado como pago.
- Item com qty=3, pagar 2 → reabrir, item mostra "1/3 pendente, 2/3 pago" e qty restante = 1.
- Pagar último item pendente → comanda fecha, mesa libera (mesma lógica de hoje).
- Dois caixas no mesmo PDV: caixa A marca itens A; caixa B vê esses itens com cadeado e não consegue selecionar.
- Cancelar dialog após selecionar → locks liberados, próximo caixa consegue selecionar.
- Desconto 10% aplicado em modo by-product → desconto incide só sobre o subtotal selecionado.
- Auditoria: `pdv_payments` ganha 1 linha por pagamento parcial; `pdv_payment_items` mostra a composição.
- Balcão (comanda virtual sem registro): o seletor "Por produto" fica desabilitado com tooltip "disponível apenas para comandas/mesas".
