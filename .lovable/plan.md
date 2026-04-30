# Importação inteligente de notas fiscais → estoque

Hoje o wizard de importação (`InvoiceReviewWizard`) já lê os itens da NF-e, deixa o usuário criar/vincular ingredientes manualmente e grava `pdv_invoice_items`. Faltam: sugestão automática, bloqueio de itens sem vínculo, baixa/entrada de estoque após confirmar, e memória de vínculos por fornecedor.

## O que vai mudar (visão do usuário)

1. **Importou a nota** → o sistema já abre o passo "Produtos" com cada item pintado:
   - 🟢 Verde "Vinculado automaticamente" (alta confiança)
   - 🟡 Amarelo "Sugestão — confirme" (média confiança, mostra top 3 candidatos)
   - 🔵 Azul "Criar novo" (sem correspondência — formulário pré-preenchido)
2. Itens com vínculo aprendido do mesmo fornecedor são vinculados sem perguntar.
3. Para itens com várias correspondências possíveis, aparecem cartões de sugestão (com nome, código, EAN, último preço) e botões "Usar este" / "Criar novo".
4. **Não dá para confirmar** a importação enquanto houver item com status `none` (sem vínculo nem criação) — botão fica desabilitado e indica quantos faltam.
5. Ao confirmar:
   - Cria os novos ingredientes pendentes.
   - **Dá entrada no estoque** de todos os itens (somando `quantity` ao `current_stock` do ingrediente vinculado, atualizando `unit_cost`/`average_cost`/`last_entry_date`).
   - Registra movimentos em `pdv_stock_movements` tipo `entrada` com motivo "Entrada por NF-e nº X".
   - Salva o vínculo `produto-da-nota → ingrediente` por fornecedor para reaproveitar nas próximas importações.
6. A transação financeira já é criada hoje — mantemos.

## Regras de matching (em ordem, primeira que casar vence)

Para cada item da nota, contra `pdv_ingredients` do usuário:

| Critério | Confiança | Ação |
|---|---|---|
| Vínculo aprendido (mesmo fornecedor + mesmo `productCode` ou `productEan` em importação anterior) | Auto | vincula sem perguntar |
| EAN igual e não vazio | Auto | vincula sem perguntar |
| `code` igual ao `productCode` da nota | Auto | vincula sem perguntar |
| Mesmo NCM + nome ≥ 85% similar (Jaccard sobre tokens normalizados) + unidade compatível | Sugestão | mostra top 3, usuário confirma |
| Nome ≥ 70% similar (com normalização: lowercase, sem acentos, sem stop-words "kg", "un", "cx") | Sugestão | mostra top 3 |
| Nada acima | Criar novo | pré-preenche formulário |

Unidades equivalentes são tratadas como compatíveis: `un`/`und`/`pc`, `kg`/`quilo`, `lt`/`l`/`litro`, `cx`/`caixa`.

## Mudanças técnicas

### Banco (migration nova)

```sql
-- 1) Memória de vínculos por fornecedor
create table public.pdv_invoice_item_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  supplier_id uuid references public.pdv_suppliers(id) on delete cascade,
  supplier_cnpj text,
  product_code text,
  product_ean text,
  ingredient_id uuid not null references public.pdv_ingredients(id) on delete cascade,
  times_used int not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index on public.pdv_invoice_item_links
  (user_id, supplier_id, coalesce(product_code,''), coalesce(product_ean,''));
alter table public.pdv_invoice_item_links enable row level security;
create policy "owner read"   on public.pdv_invoice_item_links for select using (auth.uid() = user_id or is_establishment_member(user_id));
create policy "owner write"  on public.pdv_invoice_item_links for insert with check (auth.uid() = user_id);
create policy "owner update" on public.pdv_invoice_item_links for update using (auth.uid() = user_id);
create policy "owner delete" on public.pdv_invoice_item_links for delete using (auth.uid() = user_id);
```

`pdv_stock_movements` já existe e o enum tem `entrada` — usaremos esse tipo.

### Frontend

- **Novo:** `src/lib/invoice/match-ingredients.ts`
  - `normalize(str)`, `tokenize(str)`, `jaccard(a,b)`, `unitsCompatible(a,b)`
  - `matchInvoiceItems(items, ingredients, learnedLinks)` → para cada item devolve `{ bestMatch, confidence: 'auto'|'suggest'|'none', candidates: top3 }`.

- **Novo hook:** `src/hooks/use-invoice-item-links.ts`
  - `useInvoiceItemLinks(supplierIdOrCnpj)` → lê os vínculos aprendidos do fornecedor.
  - `upsertInvoiceItemLinks(rows[])` chamado no confirm.

- **`InvoiceReviewWizard.tsx`**
  - No `useEffect` de inicialização, depois de `parseInvoiceToEditable`, rodar `matchInvoiceItems` e setar `linkAction.type='link'` para os `auto`, deixar `none` com `suggestedIngredientId` para os `suggest`, `create` (com dados pré-preenchidos) para os `none`.
  - Bloquear botão "Confirmar" quando `items.some(i => i.linkAction.type === 'none')`. Mostrar contador "X itens sem vínculo".
  - No `handleConfirm`, depois de criar ingredientes/nota:
    - Para cada item vinculado/criado: `update pdv_ingredients set current_stock = current_stock + qty, unit_cost = qty*unit_value (ponderado), average_cost = …, last_entry_date = entryDate`.
    - `insert pdv_stock_movements (ingredient_id, type='entrada', quantity, unit_cost, reason='Entrada NF-e nº X', created_by=user)`.
    - `upsertInvoiceItemLinks` salvando `(supplier_id, product_code, product_ean, ingredient_id)` para cada item.

- **`IngredientLinker.tsx`**
  - Aceitar prop opcional `suggestions: Ingredient[]` e renderizar até 3 cartões "Sugestão" com botão "Usar este".
  - Badge "Sugerido" amarela quando há sugestão pendente.
  - Mostrar último preço de compra (`pdv_ingredient_suppliers.last_price`) quando disponível.

- **`Step4ProductsData.tsx`**
  - Trocar contador de status por: Vinculados (auto + manual), Sugestões pendentes, A criar, **Sem vínculo (bloqueia)**.
  - Botão "Aceitar todas as sugestões" que aplica as `suggest` no melhor candidato.

- **`InvoiceReviewWizard` → step 5** mostra alerta se ainda há `none`.

### Edge cases / decisões

- Quando `match_status` ficar `matched` mas vier de sugestão aceita pelo usuário, salva no `pdv_invoice_item_links` (aprendizado).
- Se o item já foi importado antes (mesma `invoice_key` + `item_number`), não duplica entrada de estoque (verificação por `pdv_stock_movements.reason` contendo a chave + item — ou ainda melhor, adicionar coluna opcional `invoice_item_id` nos movimentos numa migration futura; por ora usaremos a chave no `reason` e checagem por unicidade lógica antes do insert).
- `unit_cost` médio ponderado: `new_avg = (current_stock*old_avg + qty*unit_value) / (current_stock + qty)`.
- Se a nota não tiver fornecedor cadastrado ainda, o vínculo aprendido é gravado pelo `supplier_id` recém-criado.

## Arquivos tocados

- novo: `supabase/migrations/<timestamp>_invoice_item_links.sql`
- novo: `src/lib/invoice/match-ingredients.ts`
- novo: `src/hooks/use-invoice-item-links.ts`
- editar: `src/components/pdv/invoices/InvoiceReviewWizard.tsx`
- editar: `src/components/pdv/invoices/IngredientLinker.tsx`
- editar: `src/components/pdv/invoices/ProductItemEditor.tsx`
- editar: `src/components/pdv/invoices/review-steps/Step4ProductsData.tsx`
- editar: `src/components/pdv/invoices/review-steps/Step5FinalReview.tsx` (alerta "X sem vínculo")
- editar: `src/types/invoice.ts` (adicionar `suggestedIngredientId?: string` e `candidates?: Ingredient[]` no `EditableInvoiceItem`)

## Critérios de aceite mapeados

- ✅ Lista todos os itens — já faz, ganha cores por confiança.
- ✅ Vincula automático por código/EAN/NCM+nome.
- ✅ Mostra alternativas quando há ambiguidade.
- ✅ Cria novo com dados pré-preenchidos.
- ✅ Atualiza estoque + custo médio + last_entry_date.
- ✅ Registra movimento de entrada (rastreio).
- ✅ Bloqueia confirmar com itens sem vínculo (sem duplicar).
- ✅ Aprende vínculo por fornecedor para reuso.
