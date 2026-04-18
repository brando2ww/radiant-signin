

## Objetivo

Tornar funcional o sistema de **produtos compostos (Kits/Combos)**, garantindo que ao adicionar o pai numa comanda:
1. Apenas o pai aparece visualmente na comanda (preço, total).
2. Cada sub-produto seja registrado/expandido como item "filho" para roteamento de cozinha.
3. Cada filho seja impresso no **centro de produção do filho** (não do pai), com referência ao pai no cupom.

## Diagnóstico do estado atual

- ✅ Tabela `pdv_product_compositions` existe com `parent_product_id`, `child_product_id`, `quantity`, `order_position`.
- ✅ `pdv_products.is_composite` e `stock_deduction_mode` existem.
- ✅ `ProductCompositionManager` permite cadastrar sub-produtos.
- ❌ Ao adicionar um produto composto na comanda (`addItem` em `usePDVComandas`), nada acontece de especial — só insere o pai. Nenhum filho é gerado.
- ❌ Print Bridge nunca recebe os filhos (porque nunca foram criados).
- ❌ View `vw_print_bridge_comanda_items` não tem como mostrar "este item faz parte de X" (sem coluna `parent_item_id` em `pdv_comanda_items`).

## Arquitetura proposta

### 1. Schema (1 migration)

Adicionar em `pdv_comanda_items` e `pdv_order_items`:
- `parent_item_id uuid NULL` — referência ao item pai na mesma comanda (self-FK, `ON DELETE CASCADE`)
- `is_composite_child boolean DEFAULT false` — flag para identificar filhos
- Índice em `parent_item_id`

Atualizar views `vw_print_bridge_*` para incluir:
- `parent_product_name` (via JOIN no item pai)
- `parent_item_id`
- `is_composite_child`

### 2. Hook `usePDVComandas.addItem`

Após inserir o pai, se `product.is_composite`:
1. Buscar `pdv_product_compositions` do pai.
2. Para cada filho:
   - Resolver `production_center_id` do filho (via `resolveProductionCenterId`).
   - Inserir em `pdv_comanda_items`: `product_id` = filho, `quantity` = `parent.quantity * comp.quantity`, `unit_price = 0` (preço já está no pai), `parent_item_id` = id do pai, `is_composite_child = true`, `kitchen_status = "pendente"`.
3. Trigger existente recalcula subtotal automaticamente (não duplica porque filhos têm `unit_price = 0`).

Mesma lógica em `usePDVOrders.addItem`.

### 3. UI da comanda (`getItemsByComanda`)

Filtrar para mostrar **apenas itens não-filhos** (`is_composite_child = false`) na lista visível ao garçom. Filhos ficam invisíveis na UI mas existem no banco para roteamento.

Arquivos atingidos:
- `src/pages/garcom/GarcomComandaDetalhe.tsx`
- `src/pages/garcom/GarcomAdicionarItem.tsx`
- `src/components/pdv/ComandaCard.tsx`
- `src/components/pdv/ComandaDetailsDialog.tsx`

### 4. Envio à cozinha (`sendToKitchen`)

Quando garçom clica "Enviar para Cozinha":
- Hoje envia só os IDs visíveis (pais).
- Mudar para também incluir os filhos (`parent_item_id IN (...)` dos pendentes).
- Cada filho dispara INSERT/UPDATE no Realtime → Print Bridge imprime no IP do centro do filho.

### 5. Print Bridge

Atualizar `printRow` em `print-bridge/server.js` para, quando `is_composite_child = true`, incluir no header do cupom:
```
+ Parte de: HOT ROLL COMBO (Mesa 5)
```
Assim o cozinheiro do Sushi sabe que o Hot Roll faz parte do combo, e o cozinheiro da Cozinha Fria sabe que o Ceviche faz parte do mesmo combo.

### 6. Validações

- Bloquear adicionar produto composto se algum filho não tem `printer_station` configurado (toast de aviso).
- Bloquear se algum filho aponta para centro inativo.

## Fluxo de exemplo

```text
Garçom adiciona "Menu Degustação" (R$ 120) na Mesa 5
   └─ pdv_comanda_items insere:
       1. Menu Degustação (pai)        unit_price=120  parent=null  is_child=false
       2. Hot Roll (filho)              unit_price=0    parent=#1    is_child=true   center=Sushi
       3. Ceviche (filho)               unit_price=0    parent=#1    is_child=true   center=Cozinha Fria
       4. Mochi (filho)                 unit_price=0    parent=#1    is_child=true   center=Confeitaria

UI mostra apenas:  "1x Menu Degustação - R$ 120,00"
Subtotal:                                      R$ 120,00

Garçom clica "Enviar para Cozinha"
   └─ sent_to_kitchen_at preenchido nos itens 1, 2, 3, 4
   └─ Print Bridge recebe 3 INSERTs Realtime (filhos com centro)
       ├─ Imprime em SUSHI:        "1x HOT ROLL  + Parte de: MENU DEGUSTAÇÃO"
       ├─ Imprime em COZINHA FRIA: "1x CEVICHE   + Parte de: MENU DEGUSTAÇÃO"
       └─ Imprime em CONFEITARIA:  "1x MOCHI     + Parte de: MENU DEGUSTAÇÃO"
```

## Arquivos a editar

**Migration:** 1 nova
- `parent_item_id`, `is_composite_child` em `pdv_comanda_items` e `pdv_order_items`
- Recriar views `vw_print_bridge_order_items` e `vw_print_bridge_comanda_items`

**Frontend:**
- `src/hooks/use-pdv-comandas.ts` — expandir `addItem`, ajustar `removeItem` (cascade já cobre), `sendToKitchen`
- `src/hooks/use-pdv-orders.ts` — mesma lógica em `addItem`
- `src/pages/garcom/GarcomComandaDetalhe.tsx` — filtrar filhos da listagem
- `src/pages/garcom/GarcomAdicionarItem.tsx` — filtrar filhos do contador de pendentes
- `src/components/pdv/ComandaCard.tsx` — filtrar filhos
- `src/components/pdv/ComandaDetailsDialog.tsx` — filtrar filhos
- `src/components/pdv/ProductCompositionManager.tsx` — adicionar aviso visual quando filho não tem `printer_station`

**Print Bridge:**
- `print-bridge/server.js` — adicionar linha "Parte de: X" no cupom quando `is_composite_child = true`
- Importante: usuário precisa baixar o ZIP atualizado e reinstalar nas máquinas.

## Por que assim

- **Roteamento por centro funciona naturalmente**: cada filho carrega seu próprio `production_center_id`, Print Bridge já sabe o que fazer.
- **Visibilidade limpa para o garçom**: vê só "Menu Degustação", não polui a comanda.
- **Cozinha sabe o contexto**: cupom mostra "Parte de: X" para coordenar tempo entre estações.
- **Estoque correto**: `stock_deduction_mode = "components"` baixa por filho; `"main"` baixa só o pai (não muda nada da lógica atual).
- **Fiscalmente correto**: tributação fica no pai (filhos têm `unit_price = 0`), conforme já documentado no `Alert` do `ProductCompositionManager`.

