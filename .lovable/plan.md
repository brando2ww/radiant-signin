

# Reformular Controle de Validade

Reescrever `ExpiryTrackingPanel` como central de gestao de validades com alertas visuais, historico de perdas, formulario em drawer lateral, cadastro rapido e filtros avancados.

## Mudancas no banco de dados

### Migration: Novas colunas em `product_expiry_tracking`

```sql
ALTER TABLE public.product_expiry_tracking
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'outros',
  ADD COLUMN IF NOT EXISTS storage_location text,
  ADD COLUMN IF NOT EXISTS quantity numeric DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT 'unidades',
  ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS temperature numeric,
  ADD COLUMN IF NOT EXISTS discard_reason text,
  ADD COLUMN IF NOT EXISTS discarded_quantity numeric,
  ADD COLUMN IF NOT EXISTS discarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS origin text DEFAULT 'manual';
```

Campos cobrem: categoria, local de armazenamento, quantidade/unidade, custo unitario (para calculo de perdas), temperatura, motivo de descarte, quantidade descartada, data do descarte e origem (manual ou checklist).

## Arquivos novos

### 1. `src/components/pdv/checklists/expiry/ExpiryAlertBlock.tsx`

Bloco de atencao imediata no topo:
- 3 grupos: vencidos (fundo vermelho), vence em 1 dia (laranja), vence em 3 dias (amarelo)
- Cada item: nome, lote, validade, local de armazenamento
- Botoes de acao rapida: Descartar, Usar hoje, Adiar

### 2. `src/components/pdv/checklists/expiry/ExpiryOverview.tsx`

4 cards de indicadores:
- Total de produtos ativos
- Produtos em alerta (<=3 dias)
- Vencidos nao descartados
- Perdas do mes (quantidade + valor estimado)

### 3. `src/components/pdv/checklists/expiry/ExpiryFilters.tsx`

Filtros expandidos:
- Busca por nome/lote
- Categoria (Carnes, Lacticinios, Hortifruti, Bebidas, Secos, Congelados)
- Local de armazenamento (Camara fria, Freezer, Prateleira, Geladeira)
- Status (Todos, OK, Atencao, Critico, Vencido, Descartado)
- Toggle tabela/cards

### 4. `src/components/pdv/checklists/expiry/ExpiryTable.tsx`

Tabela melhorada:
- Colunas: Produto, Categoria (icone+cor), Lote, Local, Quantidade+unidade, Validade, Status, Dias (badge colorido), Quem registrou, Acoes (editar, descartar, duplicar)
- Linhas vencidas com fundo vermelho
- Ordenacao clicavel

### 5. `src/components/pdv/checklists/expiry/ExpiryDrawer.tsx`

Drawer lateral para registro/edicao:
- Nome com autocomplete de produtos ja cadastrados
- Categoria com icones visuais
- Lote, data de validade, quantidade + unidade
- Local de armazenamento
- Valor unitario estimado (opcional)
- Temperatura (opcional)
- Observacao
- Colaborador registrante (automatico)

### 6. `src/components/pdv/checklists/expiry/DiscardDialog.tsx`

Mini formulario de descarte:
- Motivo (Vencido, Avariado, Contaminado, Outro)
- Quantidade descartada
- Observacao
- Salva com status "descartado" e preenche campos de descarte

### 7. `src/components/pdv/checklists/expiry/ExpiryLossHistory.tsx`

Historico de perdas:
- Lista de descartados: nome, lote, validade, data descarte, motivo, responsavel, valor perda
- Totalizador: itens + valor total
- Filtro por periodo
- Exportar CSV

### 8. `src/components/pdv/checklists/expiry/FrequentProducts.tsx`

Produtos frequentes:
- Lista dos mais cadastrados (agrupado por product_name, contagem)
- Um clique pre-preenche drawer com nome e categoria
- Reduz tempo de registro

## Arquivos editados

### 9. `src/hooks/use-product-expiry.ts`

Expandir:
- `ExpiryItem` com novos campos (category, storage_location, quantity, unit, unit_cost, temperature, origin, discard_reason, discarded_quantity, discarded_at)
- `useCreateExpiry` aceita todos os novos campos
- Nova mutacao `useDiscardExpiry` que atualiza status + discard_reason + discarded_quantity + discarded_at
- `useExpiryHistory` retorna campos de descarte
- Novo hook `useExpiryLossSummary` que calcula perdas do mes (soma de unit_cost * discarded_quantity)
- Novo hook `useFrequentProducts` que busca produtos mais cadastrados (group by product_name, count)
- `useUpdateExpiry` para edicao completa de produto

### 10. `src/components/pdv/checklists/ExpiryTrackingPanel.tsx`

Reescrita completa:
- Orquestra os 8 componentes novos
- Gerencia estados: filtros, drawer aberto, dialog descarte, modo visualizacao
- Tabs ou scroll: Produtos Ativos | Historico de Perdas
- Estado vazio inteligente com atalhos

## Resumo tecnico

- **1 migration** (10 colunas novas em `product_expiry_tracking`)
- **8 arquivos novos** (7 componentes + 1 dialog)
- **2 arquivos editados** (ExpiryTrackingPanel, use-product-expiry)
- **0 dependencias novas**

