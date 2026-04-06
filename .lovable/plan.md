

## Dashboard de Avaliações — Upgrade Completo (Inspirado no Concorrente)

### O que o concorrente tem e nós não temos

Analisando a screenshot do Falaê!, o dashboard deles possui:
1. **KPIs com breakdown NPS**: cards separados para Promotores, Neutros, Detratores com contagem e %
2. **Aniversariantes do Mês**: card com contagem
3. **Métricas de conversão**: Respostas → Cadastros → Cupons Gerados → Cupons Utilizados
4. **Gráfico de Conversão (Funnel)**: área chart mostrando o funil de conversão
5. **Últimos 7 dias**: chart de respostas por dia da semana
6. **NPS dos Critérios**: radar chart + tabela paginada com NPS/Promotores/Neutros/Detratores/Total por pergunta
7. **Tabela de respostas recentes**: com busca, paginação, export CSV, e botões de ação (WhatsApp, like/dislike, visualizar)
8. **Filtro de período**: date range no topo

### Plano de implementação

**1. Adicionar filtro de período no topo**
- DatePickerWithRange + botões rápidos (7d, 30d, mês atual)
- Filtrar todos os dados pelo período selecionado

**2. KPI Cards expandidos (2 linhas)**
- Linha 1: NPS Global (com cor), Aniversariantes do Mês
- Linha 2: Promotores (verde, count + %), Neutros (amarelo), Detratores (vermelho)
- Linha 3: Total Respostas, Cadastros (clientes únicos), Cupons Gerados, Cupons Utilizados

**3. Gráfico de Conversão (Funnel)**
- AreaChart mostrando: Respostas → Cadastros → Cupons Gerados → Cupons Utilizados
- Dados das tabelas `customer_evaluations`, `roulette_results`, `coupons`

**4. Chart "Últimos 7 dias"**
- Respostas agrupadas por dia da semana (Segunda a Domingo)

**5. NPS dos Critérios — dual view**
- Radar chart (RadarChart do Recharts) com NPS por pergunta
- Tabela ao lado com colunas: Questão, NPS, Promotores, Neutros, Detratores, Total — paginada e com busca

**6. Tabela de Respostas Recentes**
- Colunas: Horário, Cliente, NPS, Sugestão, Ações
- Busca por nome/whatsapp
- Paginação (10 por página)
- Botão Exportar CSV
- Botões de ação: abrir WhatsApp, visualizar detalhes

### Arquivos alterados

1. **`src/pages/evaluations/EvaluationsDashboard.tsx`** — reescrever com todos os novos componentes e seções
2. **`src/hooks/use-customer-evaluations.ts`** — adicionar dados de cupons/cadastros ao stats (ou criar hook separado)
3. **Possível novo hook** `use-dashboard-coupons.ts` — buscar contagem de cupons gerados/utilizados

### Dados necessários que já existem
- NPS, promotores, neutros, detratores → `useEvaluationStats`
- Aniversariantes → filtrar `customer_birth_date` pelo mês atual
- Respostas por pergunta → `evaluation_answers` + `useEvaluationQuestionTexts`
- Clientes únicos (cadastros) → `distinct customer_whatsapp`
- Cupons → tabelas `roulette_results` / `coupons` (verificar existência)

