

## Etapa 5 — Clientes com Dados Reais (Painel / Gestão / Aniversariantes)

### Fonte de dados
Todas as 3 páginas usarão o hook `useCustomerEvaluations()` (sem filtro de data) para buscar todas as avaliações e agrupar por `customer_whatsapp`. Não precisa de schema novo.

### Páginas

**1. ClientsPanel.tsx — Painel de KPIs**
- KPI cards: Total clientes únicos (distinct whatsapp), Recorrentes (2+ avaliações), Média de avaliações/cliente, Novos no mês (primeira avaliação no mês atual)
- Gráfico: Evolução de novos clientes por mês (BarChart últimos 6 meses)
- Gráfico: Distribuição de recorrência (PieChart: 1 avaliação, 2-3, 4+)

**2. ClientsManagement.tsx — Gestão / Tabela**
- Busca por nome ou WhatsApp
- Tabela com colunas: Nome, WhatsApp, Total avaliações, NPS médio, Última avaliação, Campanhas
- Ordenação por total de avaliações (desc)
- Badge colorido para NPS (Promotor/Neutro/Detrator)
- Paginação (10 por página)

**3. ClientsBirthdays.tsx — Aniversariantes**
- Filtro por período: 7, 15, 30 dias (Select)
- Contagem de aniversariantes no período selecionado
- Tabela: Nome, WhatsApp, Data de aniversário, Idade, Dias restantes
- Ordenado por dias restantes (mais próximo primeiro)
- Usa `customer_birth_date` das avaliações, agrupado por whatsapp

### Detalhes técnicos
- Reutiliza `useCustomerEvaluations()` para buscar dados
- Agrupamento client-side por `customer_whatsapp` com `useMemo`
- `date-fns` para cálculos de aniversário (differenceInDays, addDays, isBefore, isAfter)
- Recharts para gráficos (BarChart, PieChart)
- Sem mudanças de banco ou novos hooks — tudo computado localmente

### Arquivos editados
- `src/pages/pdv/evaluations/clients/ClientsPanel.tsx`
- `src/pages/pdv/evaluations/clients/ClientsManagement.tsx`
- `src/pages/pdv/evaluations/clients/ClientsBirthdays.tsx`

