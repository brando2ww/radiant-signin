

# Reformular Pagina Tarefas do Dia

Reescrever o `DailyTasksView` como uma central de comando operacional baseada em `checklist_executions` e `checklist_schedules` (dados reais do sistema de checklists), em vez do antigo sistema de `operational_task_instances`.

## Abordagem

A pagina atual usa `operational_task_instances` (tarefas simples geradas de templates). O sistema real de checklists ja tem `checklist_schedules`, `checklist_executions`, `checklist_operators` com dados muito mais ricos. A nova pagina vai integrar ambos: mostra execucoes de checklists agendados para hoje como as "tarefas do dia", e mantem o botao de gerar tarefas do sistema antigo como fallback.

## Sem mudancas no banco de dados

Todos os dados necessarios ja existem nas tabelas `checklist_schedules`, `checklist_executions`, `checklist_operators` e `checklists`. Nenhuma migration necessaria.

## Arquivos novos

### 1. `src/components/pdv/tasks/DailyOverview.tsx`

Topo da pagina:
- Data de hoje com dia da semana
- Turno atual destacado (usa `getCurrentShift`)
- 4 mini-cards: Total, Concluidas, Em andamento, Atrasadas (calculados das execucoes do dia)
- Barra de progresso geral
- Botao "Gerar Tarefas" contextual (some se ja tem tarefas, vira "Regerar" se existem)

### 2. `src/components/pdv/tasks/DailyTaskFilters.tsx`

Barra de filtros:
- Filtro turno (3 botoes)
- Filtro setor (select)
- Filtro responsavel (select com operadores)
- Filtro status (todas/pendentes/atrasadas/concluidas)
- Toggle lista/kanban

### 3. `src/components/pdv/tasks/DailyTaskCard.tsx`

Card de tarefa individual:
- Cor do setor na borda lateral
- Nome do checklist, horario previsto, prazo
- Avatar do responsavel com iniciais
- Status visual com cores (cinza/azul/verde/vermelho/amarelo)
- Icone de alerta se ha itens criticos
- Tempo restante ou tempo de atraso
- Acoes: Iniciar execucao, Ver detalhes (drawer), Reatribuir, Ignorar (com justificativa)

### 4. `src/components/pdv/tasks/DailyTaskKanban.tsx`

Visualizacao kanban alternativa:
- 4 colunas: Nao iniciada, Em andamento, Concluida, Atrasada
- Cada coluna usa `DailyTaskCard` compacto
- Contagem por coluna no cabecalho

### 5. `src/components/pdv/tasks/TaskDetailDrawer.tsx`

Drawer lateral ao clicar "Ver detalhes":
- Nome do checklist, setor, responsavel
- Lista de itens com status de cada um (preenchido/pendente)
- Opcao de reatribuir responsavel
- Botao de iniciar execucao

### 6. `src/hooks/use-daily-tasks.ts`

Hook dedicado que:
- Busca `checklist_schedules` ativos para o dia da semana atual (com join em `checklists` e `checklist_operators`)
- Busca `checklist_executions` do dia com joins
- Combina schedules + execucoes para montar lista de "tarefas do dia" com status derivado
- Calcula metricas (total, concluidas, em andamento, atrasadas baseado em `start_time` + `max_duration_minutes`)
- Polling a cada 30s para atualizar status de atraso
- Mutation para reatribuir operador
- Mutation para marcar como ignorada (atualiza status da execution)

## Arquivos editados

### 7. `src/components/pdv/tasks/DailyTasksView.tsx`

Reescrita completa:
- Importa `DailyOverview`, `DailyTaskFilters`, `DailyTaskCard`, `DailyTaskKanban`, `TaskDetailDrawer`
- Gerencia estados de filtro, modo de visualizacao, drawer aberto, execucao ativa
- Se clica em "Iniciar", renderiza `ChecklistExecutionPage` existente em vez da lista
- Estado vazio inteligente: botao centralizado + atalho para agendamento se nao ha schedules
- Polling com `refetchInterval: 30000` para alertas em tempo real
- Toast automatico quando tarefa entra em atraso

### 8. `src/pages/pdv/Tasks.tsx`

- Passar `onNavigate` para `DailyTasksView` para permitir navegacao para agendamento
- Passar `user` e `operators` necessarios

## Resumo tecnico

- **0 migrations** (usa tabelas existentes)
- **6 arquivos novos** (5 componentes + 1 hook)
- **2 arquivos editados** (DailyTasksView, Tasks.tsx)
- **0 dependencias novas**

