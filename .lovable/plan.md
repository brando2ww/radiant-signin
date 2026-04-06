
## Etapa 4 — Relatórios com Dados Reais (Diário / Semanal / Mensal)

### O que será feito
Implementar as 3 páginas de relatórios usando o hook `useCustomerEvaluations` existente, filtrando por período, e o `useEvaluationStats` para computar KPIs. Cada página terá KPI cards + gráficos Recharts.

### Páginas

**1. Relatório Diário** (`ReportDaily.tsx`)
- Filtra avaliações do dia atual (`startDate = hoje`, `endDate = hoje`)
- KPI cards: Total respostas do dia, Média satisfação, NPS do dia, Alertas negativos (nota < 3)
- Tabela de alertas negativos com nome do cliente, WhatsApp, média e comentários
- Gráfico de distribuição por hora do dia (BarChart)

**2. Relatório Semanal** (`ReportWeekly.tsx`)
- Filtra avaliações da semana atual (seg-dom) e semana anterior
- KPI cards com variação percentual (↑↓): Respostas, Média, NPS — semana atual vs anterior
- Gráfico comparativo: respostas por dia da semana atual vs anterior (BarChart agrupado)
- Gráfico de evolução da satisfação diária (AreaChart, últimos 14 dias)

**3. Relatório Mensal** (`ReportMonthly.tsx`)
- Filtra avaliações do mês atual
- KPI cards: Total respostas, Média, NPS, Promotores %
- NPS Donut (PieChart com promotores/neutros/detratores)
- Distribuição de notas (BarChart 1-5 estrelas)
- Satisfação por dia da semana (BarChart)
- Distribuição por faixa etária (BarChart)
- Botão de exportar CSV usando `useExportEvaluations`

### Detalhes técnicos
- Reutiliza `useCustomerEvaluations({ startDate, endDate })` passando filtros de data com `date-fns` (`startOfDay`, `startOfWeek`, `startOfMonth`)
- Reutiliza `useEvaluationStats(startDate, endDate)` para cálculos de NPS, faixa etária, etc.
- Reutiliza padrão visual do `CampaignReports.tsx` (CustomTooltip, COLORS, cards)
- Gráficos com Recharts (já no projeto)
- Sem mudanças de schema/banco

### Arquivos editados
- `src/pages/pdv/evaluations/reports/ReportDaily.tsx` — reescrever com dados reais
- `src/pages/pdv/evaluations/reports/ReportWeekly.tsx` — reescrever com dados reais
- `src/pages/pdv/evaluations/reports/ReportMonthly.tsx` — reescrever com dados reais
