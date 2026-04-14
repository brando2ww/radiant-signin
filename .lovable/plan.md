

# Fases 3 e 4 -- Execucao do Colaborador + Painel do Gestor

## FASE 3 -- Tela do Colaborador (Execucao)

### 3.1 Reescrever PublicTasks com login por PIN

**Arquivo**: `src/pages/PublicTasks.tsx`

Substituir o conteudo atual por um fluxo de duas etapas:
1. **Tela de PIN**: InputOTP de 4 digitos. Valida contra `checklist_operators` onde `user_id = :userId` e `pin = :input`. Se invalido, mostra erro. Se valido, armazena operador no state.
2. **Lista de checklists do turno**: Apos login, busca `checklist_schedules` do dia/turno atual atribuidos ao operador (por `assigned_operator_id` ou `assigned_sector` = setor do operador). Cada card mostra nome, setor, status (pendente/em andamento/concluido) e botao "Iniciar"/"Continuar".

### 3.2 Hook de execucao

**Arquivo novo**: `src/hooks/use-checklist-execution.ts`

- `startExecution(checklistId, scheduleId, operatorId)`: cria registro em `checklist_executions` com status `em_andamento` e `started_at = now()`
- `loadExecution(executionId)`: busca execution + execution_items + items (join) para montar tela
- `saveItemValue(executionItemId, value, photoUrl, isCompliant)`: upsert em `checklist_execution_items`
- `completeExecution(executionId)`: atualiza status para `concluido`, calcula score, salva `completed_at`
- `createAlert(executionId, itemId, alertType, message)`: insere em `checklist_alerts`
- Logica de turno: determinar turno atual baseado na hora e nas configuracoes de shifts

### 3.3 Componentes de execucao

**Pasta nova**: `src/components/pdv/checklists/execution/`

1. **ChecklistExecutionPage.tsx** -- Layout mobile-first principal
   - Header com nome do checklist, cronometro (tempo restante = `max_duration_minutes` - tempo decorrido), barra de progresso
   - Lista scrollavel de itens
   - Botao "Concluir" desabilitado ate todos os `is_required` preenchidos

2. **ExecutionItemRenderer.tsx** -- Renderiza item por tipo:
   - `checkbox`: Switch/toggle simples
   - `number`: Input numerico
   - `text`: Textarea
   - `photo`: Botao camera + upload para bucket `checklist-evidence` via `supabase.storage`
   - `temperature`: Input numerico + badge verde/vermelho comparando com `min_value`/`max_value`. Se fora da faixa, gera alerta automatico
   - `stars`: 5 estrelas clicaveis (Star icons)

3. **TrainingStep.tsx** -- Se item tem `training_instruction` ou `training_video_url`, mostra instrucao/iframe antes de permitir preenchimento. Checkbox "Li e entendi" para desbloquear.

4. **ExecutionTimer.tsx** -- Cronometro decrescente, muda de cor quando < 20% do tempo restante

5. **PinLoginScreen.tsx** -- Componente extraido para o login por PIN (InputOTP + validacao)

### 3.4 Upload de fotos

Usar `supabase.storage.from("checklist-evidence").upload()` com path `{userId}/{executionId}/{itemId}.jpg`. Salvar URL publica no campo `photo_url` do `checklist_execution_items`.

---

## FASE 4 -- Painel do Gestor + Alertas + Dashboard Widget

### 4.1 Nova aba "Painel" na pagina de Tarefas

**Arquivo**: `src/pages/pdv/Tasks.tsx` -- adicionar tab "Painel" como primeira aba

**Componente novo**: `src/components/pdv/checklists/DashboardPanel.tsx`

- Cards de resumo: concluidos, atrasados, nao iniciados (query `checklist_executions` do dia)
- Filtros: data (DatePicker), turno (Select), setor (Select), colaborador (Select)
- Linha do tempo: lista cronologica de execucoes com badges de cor por status
- Feed de atividades recentes (ultimas 20 execucoes com operador e hora)

### 4.2 Grafico de taxa de conclusao

**Componente novo**: `src/components/pdv/checklists/CompletionChart.tsx`

- Recharts BarChart mostrando % conclusao por dia da semana (ultimos 7 dias)
- Usa `ChartContainer` existente

### 4.3 Comparativo de turnos

**Componente novo**: `src/components/pdv/checklists/ShiftComparison.tsx`

- 3 cards lado a lado (manha/tarde/noite) com % conclusao, total, atrasados
- Query agrupa execucoes do dia por turno do schedule

### 4.4 Secao de alertas

**Componente novo**: `src/components/pdv/checklists/AlertsPanel.tsx`

- Lista de alertas nao reconhecidos no topo (destaque vermelho)
- Historico filtravel por data/tipo
- Botao "Reconhecer" por alerta (atualiza `is_acknowledged`, `acknowledged_by`, `acknowledged_at`)

### 4.5 Hook do painel

**Arquivo novo**: `src/hooks/use-checklist-dashboard.ts`

- `useDashboardMetrics(filters)`: query execucoes agrupadas por status
- `useCompletionChart(days)`: taxa de conclusao por dia
- `useShiftComparison(date)`: metricas por turno
- `useChecklistAlerts()`: alertas nao reconhecidos + historico
- `useRecentActivity()`: ultimas execucoes com joins

### 4.6 Widget "Saude da Operacao" no Dashboard PDV

**Arquivo editado**: `src/pages/pdv/Dashboard.tsx`

- Adicionar card com semaforo (circulo verde/amarelo/vermelho)
- Verde: >90% concluidos no prazo; Amarelo: 70-90%; Vermelho: <70%
- Query simples: `checklist_executions` do dia com status `concluido` vs total

**Componente novo**: `src/components/pdv/checklists/OperationHealthWidget.tsx`

---

## Resumo tecnico

- **0 migrations**: todas as tabelas ja existem (Fase 1 concluida)
- **~10 arquivos novos**: 5 em `execution/`, 4 no painel, 1 hook de execucao, 1 hook de dashboard
- **~2 arquivos editados**: `PublicTasks.tsx` (reescrita), `Tasks.tsx` (nova aba), `Dashboard.tsx` (widget)
- Reutiliza: `InputOTP`, `Recharts`/`ChartContainer`, bucket `checklist-evidence`, tipos do Supabase

