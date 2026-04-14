

# Reformular Pagina de Agendamentos

Reescrever completamente o `SchedulesManager.tsx` e substituir o `ScheduleDialog.tsx` por um drawer lateral. Adicionar grade semanal visual, indicadores, filtros e formulario melhorado.

## Mudancas no banco de dados

### Migration: Colunas de configuracao avancada

```sql
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS notify_on_overdue boolean DEFAULT true;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS allow_late_completion boolean DEFAULT true;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS require_photo boolean DEFAULT false;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_type text DEFAULT 'weekly';
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_date date DEFAULT NULL;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_day_of_month integer DEFAULT NULL;
```

`recurrence_type`: `weekly` (padrao atual), `daily`, `monthly`, `once`.

## Arquivos novos

### 1. `src/components/pdv/checklists/schedules/ScheduleWeekGrid.tsx`

Grade semanal visual:
- 7 colunas (Dom-Sab) x 3 linhas (Manha/Tarde/Noite)
- Cada celula renderiza cards coloridos dos agendamentos ativos naquele dia/turno
- Card mostra: barra lateral com cor do checklist, nome, horario, responsavel
- Clicar no card abre drawer de edicao
- Clicar em celula vazia abre drawer com dia/turno pre-selecionados
- Props: `schedules`, `onEdit(id)`, `onCreateAt(day, shift)`, filtros aplicados

### 2. `src/components/pdv/checklists/schedules/ScheduleListView.tsx`

Lista cronologica alternativa:
- Tabela/lista ordenada por horario
- Colunas: cor, nome, setor, turno, dias ativos (badges), responsavel, horario, prazo, status
- Acoes rapidas: editar, duplicar, pausar/ativar (toggle `is_active`), excluir
- Props: `schedules`, `onEdit`, `onDuplicate`, `onToggle`, `onDelete`

### 3. `src/components/pdv/checklists/schedules/ScheduleDrawer.tsx`

Drawer lateral (substitui `ScheduleDialog`):
- Usa componente `Sheet` (side="right") do shadcn
- Campos melhorados:
  - Checklist: select com busca, mostra cor + setor do selecionado
  - Turno: 3 botoes visuais (Manha/Tarde/Noite)
  - Horario: input time
  - Prazo: slider + campo numerico, label legivel ("1h 30min")
  - Dias: 7 botoes toggle grandes
  - Recorrencia: radio (Diario/Semanal/Mensal/Avulso) — Avulso mostra date picker, Mensal mostra campo dia
  - Atribuicao: 3 opcoes (Colaborador/Setor/Qualquer um do turno), com seletor visual
  - Secao expansivel "Configuracoes avancadas": toggles notificar, permitir atraso, exigir foto, nota interna
- Rodape fixo: Cancelar + Salvar

### 4. `src/components/pdv/checklists/schedules/ScheduleIndicators.tsx`

4 mini-cards no topo:
- Total de agendamentos ativos
- Quantos rodam hoje (baseado no dia da semana atual)
- Turno com mais agendamentos
- Proximo agendamento do dia (com horario)

### 5. `src/components/pdv/checklists/schedules/ScheduleFilters.tsx`

Barra de filtros + toggle grade/lista:
- Filtro turno (botoes Manha/Tarde/Noite)
- Filtro setor (select)
- Filtro colaborador (select)
- Filtro status (ativo/pausado)
- Toggle visualizacao: icone grid vs icone lista

## Arquivos editados

### 6. `src/components/pdv/checklists/SchedulesManager.tsx`

Reescrita completa:
- Importa os 5 componentes acima
- Gerencia estado de filtros, modo de visualizacao (grid/list), drawer aberto/editando
- Passa callbacks de criar/editar/duplicar/pausar/excluir
- Estado vazio: grade semanal vazia com placeholders + mensagem convidativa + atalhos para templates

### 7. `src/hooks/use-checklist-schedules.ts`

- Expandir select para incluir `checklists(name, sector, color)`
- Adicionar mutation `duplicateSchedule` (copia com novo id)
- Adicionar mutation `toggleSchedule` (atualiza `is_active`)
- Incluir novas colunas nas mutations de create/update

### 8. `src/components/pdv/checklists/ScheduleDialog.tsx`

Removido (substituido pelo `ScheduleDrawer`)

## Resumo tecnico

- **1 migration** (7 colunas novas em `checklist_schedules`)
- **5 arquivos novos** (4 componentes de UI + 1 filtros)
- **2 arquivos editados** (SchedulesManager, use-checklist-schedules)
- **1 arquivo removido** (ScheduleDialog)
- **0 dependencias novas** (Sheet/Slider/Calendar ja existem)

