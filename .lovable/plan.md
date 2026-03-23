

## Levantamento e Plano de Correção dos Relatórios

### Diagnóstico por Página

| Pagina | Status | Problema |
|--------|--------|----------|
| **PDV Dashboard** (`/pdv/dashboard`) | Funcional | Busca dados reais do Supabase |
| **PDV Relatórios** (`/pdv/relatorios`) | Funcional | Hook busca vendas, pagamentos, produtos, por hora |
| **Lançamentos Financeiros** (`/pdv/financeiro/lancamentos`) | Funcional | CRUD completo com stats |
| **Contas a Pagar** (`/pdv/financeiro/contas-pagar`) | Funcional | Usa `useBills` com dados reais |
| **Contas a Receber** (`/pdv/financeiro/contas-receber`) | Funcional | Usa `useBills` com dados reais |
| **Fluxo de Caixa** (`/pdv/financeiro/fluxo-caixa`) | ESTÁTICO | Tudo hardcoded `R$ 0,00`, sem hook, sem dados |
| **DRE** (`/pdv/financeiro/dre`) | ESTÁTICO | Tudo hardcoded `R$ 0,00`, sem hook, sem dados |
| **CMV Geral** (`/pdv/financeiro/cmv-geral`) | ESTÁTICO | Tudo hardcoded `R$ 0,00`, sem hook, sem dados |
| **CMV Produtos** (`/pdv/financeiro/cmv-produtos`) | ESTÁTICO | Tudo hardcoded, sem hook, sem dados |
| **Plano de Contas** (`/pdv/financeiro/plano-contas`) | ESTÁTICO | Mostra "0 contas", usa `usePDVChartOfAccounts` mas não lista dados existentes (botões sem ação) |
| **Centros de Custo** (`/pdv/financeiro/centros-custo`) | PARCIAL | Lista centros mas cards de gastos são hardcoded `R$ 0,00` |
| **Delivery Relatórios** (`/pdv/delivery/relatorios`) | Funcional | Busca dados reais do Supabase |
| **Demonstrativo de Caixa** | NAO EXISTE | Precisa ser criado |

### Plano de Correção (6 itens)

#### 1. Fluxo de Caixa — conectar com dados reais
- Buscar transações financeiras (`pdv_financial_transactions`) para entradas e saídas do mês atual
- Calcular saldo = entradas - saídas
- Gráfico de evolução mensal (últimos 6 meses) com Recharts
- Projeção baseada em contas a pagar/receber pendentes
- Filtro de período

#### 2. DRE — conectar com dados reais
- Receita Bruta = soma de vendas PDV (`pdv_orders` fechadas) + vendas Delivery (`delivery_orders` delivered)
- Deduções = pedidos cancelados + descontos
- CMV = soma de custos de ingredientes das receitas dos produtos vendidos (se houver dados de receita)
- Despesas Operacionais = transações financeiras do tipo `payable` pagas no período, agrupadas por categoria do plano de contas
- Calcular margens dinamicamente
- Filtro de período (mês)
- Botão exportar funcional

#### 3. CMV Geral — conectar com dados reais
- CMV Total = custo dos ingredientes consumidos (baseado em receitas e vendas)
- Receita Total = vendas do período
- Calcular CMV% e Margem Bruta
- Gráfico de evolução (últimos 6 meses)
- Composição por categoria de ingrediente (PieChart)
- Comparação vs mês anterior

#### 4. CMV por Produto — conectar com dados reais
- Buscar produtos que têm receitas cadastradas (`pdv_product_recipes` + `pdv_ingredients`)
- Calcular custo de cada produto baseado nos ingredientes da receita
- Margem = (preço - custo) / preço
- Classificar produtos por faixa de margem
- Listar em tabela com filtros

#### 5. Centros de Custo — calcular gastos reais
- Somar transações financeiras por `cost_center_id` no mês atual
- Substituir cards hardcoded por dados dinâmicos

#### 6. NOVO: Demonstrativo de Caixa Diário/Mensal
- Nova página `/pdv/financeiro/demonstrativo-caixa`
- Buscar sessões de caixa (`pdv_cashier_sessions`) com suas movimentações
- Visão diária: selecionar data, ver todas as sessões do dia com resumo (abertura, vendas por método, sangrias, reforços, fechamento, diferença)
- Visão mensal: agregar sessões por dia, mostrar totais de vendas, dinheiro, cartão, pix, sangrias
- KPIs: total vendido, dias com diferença de caixa, média de faturamento/dia
- Tabela detalhada das sessões com status de risco (anti-fraude)
- Botão de exportar para CSV/PDF

### Arquivos a modificar/criar

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/financial/CashFlow.tsx` | Reescrever com dados reais |
| `src/pages/pdv/financial/DRE.tsx` | Reescrever com dados reais |
| `src/pages/pdv/financial/GeneralCMV.tsx` | Reescrever com dados reais |
| `src/pages/pdv/financial/ProductCMV.tsx` | Reescrever com dados reais |
| `src/pages/pdv/financial/CostCenters.tsx` | Corrigir cards de gastos |
| `src/pages/pdv/financial/CashierStatement.tsx` | CRIAR - Demonstrativo de Caixa |
| `src/hooks/use-pdv-cash-flow.ts` | CRIAR - hook para Fluxo de Caixa |
| `src/hooks/use-pdv-dre.ts` | CRIAR - hook para DRE |
| `src/hooks/use-pdv-cmv.ts` | CRIAR - hook para CMV Geral e por Produto |
| `src/hooks/use-pdv-cashier-statement.ts` | CRIAR - hook para Demonstrativo de Caixa |
| `src/pages/PDV.tsx` | Adicionar rota do Demonstrativo de Caixa |
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar link no menu financeiro |

### Fontes de dados por relatório

```text
Fluxo de Caixa:     pdv_financial_transactions (type payable/receivable, status)
DRE:                pdv_orders + delivery_orders + pdv_financial_transactions + pdv_product_recipes
CMV Geral:          pdv_order_items + pdv_product_recipes + pdv_ingredients
CMV Produto:        pdv_products + pdv_product_recipes + pdv_ingredients
Centros de Custo:   pdv_financial_transactions (cost_center_id)
Demo. Caixa:        pdv_cashier_sessions + pdv_cashier_movements
```

### Nota importante
Todos os hooks vão reutilizar o padrão existente: `useQuery` do React Query, `supabase` client, filtro por `user_id` via `useAuth`. Os relatórios que dependem de receitas (CMV) terão fallback gracioso mostrando "Configure receitas para análise" quando não houver dados de receita cadastrados.

