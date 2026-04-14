

# Aprimorar Painel Principal dos Checklists Operacionais

Reescrever o `DashboardPanel.tsx` e expandir o hook `use-checklist-dashboard.ts` para transformar o painel em um dashboard denso e informativo.

## Arquivos editados

### 1. `src/hooks/use-checklist-dashboard.ts`

Expandir o hook para fornecer dados adicionais:

- **Saude da operacao**: ja existe `healthPct`, adicionar calculo com alertas criticos pendentes para definir nivel (verde >= 90, amarelo >= 70, vermelho < 70)
- **Tarefas criticas em aberto**: nova query filtrando execucoes atrasadas/pendentes do dia, com dados do checklist, setor, operador e horario agendado (join com `checklist_schedules.start_time`)
- **Destaques da equipe**: reutilizar logica do `useOperatorRanking("week")` inline -- buscar melhor e pior operador da semana, e checklist com maior taxa de falha nos ultimos 7 dias
- **Linha do tempo do dia**: retornar execucoes do dia ordenadas por `checklist_schedules.start_time` com status visual
- **refetchInterval**: adicionar `refetchInterval: 30000` nas queries de metricas e execucoes para atualizacao automatica

### 2. `src/components/pdv/checklists/DashboardPanel.tsx`

Reescrever completamente com layout em grid denso:

**Atalhos rapidos** (topo, ao lado do date picker):
- Botoes "Novo checklist", "Adicionar colaborador", "Ver tarefas de hoje" que chamam callbacks para navegar entre secoes (via prop ou contexto)

**Cards do topo** (`grid-cols-5`):
- 4 cards existentes melhorados: numero + percentual do total + mini barra de progresso (`Progress` component)
- 5o card "Saude da Operacao": semaforo circular colorido (verde/amarelo/vermelho) com percentual

**Grid principal** (`grid-cols-2`):
- Esquerda superior: Grafico de conclusao com linha de meta 90% (adicionar `ReferenceLine` do recharts)
- Direita superior: Comparativo de Turnos melhorado -- mostrar 3 colunas fixas (Manha/Tarde/Noite), com taxa, quantidade, atrasos, e melhor operador por turno
- Esquerda inferior: Tarefas criticas em aberto -- lista com nome, setor, responsavel, horario, tempo de atraso. Mensagem amigavel quando vazio
- Direita inferior: Feed de atividade recente -- timeline com dot colorido, nome do colaborador, acao, horario

**Linha do tempo do dia** (full width):
- Barra horizontal ou lista vertical cronologica com todos os checklists agendados, cada um com status visual (dot colorido + label)

**Destaques da equipe** (full width, 3 mini cards):
- Melhor operador da semana (com score)
- Pior desempenho (para acao)
- Checklist com maior taxa de falha

### 3. `src/components/pdv/checklists/CompletionChart.tsx`

Adicionar `ReferenceLine` do recharts em y=90 com label "Meta" e cor tracejada vermelha.

### 4. `src/components/pdv/checklists/ShiftComparison.tsx`

Melhorar para mostrar 3 colunas fixas (Manha, Tarde, Noite) mesmo quando vazias, e adicionar campo de melhor operador por turno.

### 5. `src/pages/pdv/Tasks.tsx`

Passar callback `onNavigate` para o `DashboardPanel` para que os atalhos rapidos possam trocar a secao ativa (`setActiveSection`).

## Resumo tecnico

- **0 migrations** (dados ja existem nas tabelas)
- **0 dependencias novas** (recharts ja esta instalado, `ReferenceLine` ja faz parte)
- **3 arquivos editados**: `DashboardPanel.tsx` (reescrita), `use-checklist-dashboard.ts` (expandido), `CompletionChart.tsx` (linha de meta)
- **2 arquivos com ajustes menores**: `ShiftComparison.tsx`, `Tasks.tsx`

