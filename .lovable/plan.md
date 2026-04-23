

## Reformulação UX: "Cobranças do Salão" como painel lateral fixo

### Direção

Sair do modal bloqueante e transformar a fila do salão em um **painel lateral direito fixo** (drawer permanente) na Frente de Caixa, com cards informativos, urgência visual por tempo e ações inline.

### 1. Novo layout da Frente de Caixa (`src/pages/pdv/Cashier.tsx`)

Grid passa de `grid-cols-4` para `grid-cols-12`:

```text
┌────────────────────┬──────────────┬───────────────────┐
│ Movimentações (6) │ Ações (3)   │ Salão — fila (3) │
└────────────────────┴──────────────┴───────────────────┘
```

- Coluna 1 (`col-span-6`): Movimentações (igual a hoje, só mais estreita).
- Coluna 2 (`col-span-3`): `CashierActionsSidebar` (mantém Reforço/Sangria/Cobrar/Consumo/Fechar).
- Coluna 3 (`col-span-3`): novo `<SalonQueuePanel />` — painel da fila do salão, sempre visível quando o caixa está aberto.
- Em telas `< lg`: o painel cai abaixo das ações como uma seção (mantém visível, só empilha).
- O `ChargeSelectionDialog` (modal) é **removido** do fluxo de cobrar do salão. F5 continua funcionando, mas em vez de abrir o modal, dá foco/scroll no `SalonQueuePanel` e abre o primeiro card pendente automaticamente. As abas "Comandas avulsas" e "Mesas (cobrar antecipado)" passam para um `Sheet` lateral acionado por um botão "Cobrar avulsa/mesa direta" no rodapé do painel — uso menos frequente, fora do fluxo principal.

### 2. Novo componente `SalonQueuePanel`

Arquivo: `src/components/pdv/cashier/SalonQueuePanel.tsx`.

**Cabeçalho fixo:**
- Título "Salão" + ícone.
- Linha 1: contador grande "**3** comandas aguardando" (em tempo real, vem do hook).
- Linha 2: "Total aguardando: **R$ 312,00**" (soma dos `subtotal`).
- Linha 3: "Tempo médio: 6 min" (média de `now - closed_by_waiter_at`).
- Botão refresh discreto (invalida `pdv-comandas`).
- Select compacto de ordenação: Mais antiga (default) | Maior valor | Mesa | Nome.
- Comandas com >10 min são **fixadas no topo** independente do sort.

**Lista (scroll interno):**
- Agrupada por mesa quando >1 comanda no mesmo `order_id`.
- Cabeçalho de grupo: "Mesa 5 — 2 comandas — R$ 122,00" + botão "**Cobrar tudo da Mesa 5**" (chama `onSelectTablePending`).
- Estado vazio: ícone amigável + "Nenhuma comanda aguardando cobrança" (sem abas, sem search).

### 3. Novo card `SalonQueueCard`

Arquivo: `src/components/pdv/cashier/SalonQueueCard.tsx`.

Estrutura hierárquica:
- **Linha 1:** "Mesa 5 — Eduardo" (ou "Avulsa — TESTE") em `text-base font-semibold`.
- **Linha 2:** "3 itens · **R$ 77,00**" — valor em `text-xl font-bold`.
- **Linha 3:** "Aguardando há X min" com cor progressiva:
  - <5 min → `text-muted-foreground`
  - 5–10 min → `text-yellow-600` + ícone Clock amarelo
  - >10 min → `text-red-600 font-semibold` + borda do card `border-red-500 ring-1 ring-red-200` + sufixo "— atenção"
- **Linha 4:** prévia de itens `text-xs text-muted-foreground line-clamp-1`: "1x Temaki Salmão, 2x Refrigerante, 1x..."
- **Badge de status:** Aguardando (laranja) | Em cobrança (azul, com spinner) | borda esquerda colorida pelo `order_id` (mantém código de cores atual).
- **Indicador "Mesa tem mais N comanda(s)"** quando o card está fora de um grupo (ex: outra comanda da mesma mesa ainda está aberta no garçom — usa `comandas` para contar `aberta`+`em_cobranca` no mesmo `order_id`).

**Ações inline (sem modal):**
- Botão primário grande **"Cobrar"** (full width, `h-11`) → chama `onSelectComanda`/`onSelectTablePending`, abre o `PaymentDialog` existente.
- Botão secundário **"Ver itens"** → expande inline (`useState` local), lista todos os itens com qty/preço/notas dentro do próprio card, sem modal.
- Botão discreto (link/ghost) **"Devolver ao garçom"** → abre `AlertDialog` com `<Textarea>` obrigatório de motivo. Confirma → muda status para `aberta`, limpa `closed_by_waiter_at`, salva o motivo em `notes` (append) e dispara toast no garçom via realtime. Nova mutation `returnToWaiter({comandaId, reason})` em `use-pdv-comandas.ts`.

### 4. Tempo real

- Reaproveita `usePDVComandasRealtime` (já invalida na mudança).
- Os contadores de tempo (X min) atualizam via `useEffect` com `setInterval(60000)` no `SalonQueuePanel` para re-render a cada minuto sem refetch.

### 5. Hook helper

`use-pdv-comandas.ts`:
- `returnToWaiter`: UPDATE `status='aberta'`, `closed_by_waiter_at=null`, `notes` = `notes || ''` + `\n[Devolvido ao garçom: ${reason}]`. Filtro `.in('status', ['aguardando_pagamento','em_cobranca'])` para evitar regressão.

### 6. Limpeza

- `ChargeSelectionDialog` permanece, mas vira **somente para "Comandas avulsas/Mesas direto"** acessado via botão pequeno no rodapé do painel ("Cobrar comanda/mesa direta") — não é mais o caminho principal.
- Tab "Aguardando" do dialog é removida (a função foi para o painel).
- Atalho F5: se há pendentes no painel, abre o `PaymentDialog` da mais antiga; se não há, abre o `Sheet` de cobrança avulsa.

### Validação

- Caixa aberto: painel lateral aparece à direita, sempre visível.
- 1 comanda pendente: card único, "Cobrar" abre PaymentDialog direto.
- Mesa 5 com 2 comandas: aparecem agrupadas com header e botão "Cobrar tudo" (modo split-por-comanda do PaymentDialog).
- Comanda há 12 min: borda vermelha + texto vermelho + sobe pro topo.
- "Ver itens" expande sem abrir modal; "Devolver ao garçom" exige motivo, devolve para `aberta` e some do painel.
- Caixa continua usável em paralelo (movimentações, sangria, etc.) — nada bloqueia.
- Lista vazia: mensagem amigável, sem abas.
- Tablet (1024–1280): painel mantém legibilidade; abaixo disso empilha.

