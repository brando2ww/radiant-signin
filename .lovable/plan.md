# Tornar card "Não Iniciados" clicável

## Objetivo

Permitir que ao clicar no card **"Não Iniciados"** seja aberto um dialog listando os checklists que ainda não foram iniciados no dia (mesma UX dos cards "Concluídos" e "Atrasados").

## Mudanças

### 1. `src/components/pdv/checklists/CompletedExecutionsDialog.tsx`
- Ampliar o tipo `ExecStatus` para `"concluido" | "atrasado" | "nao_iniciado"`.
- Adicionar entrada em `STATUS_CONFIG`:
  - `nao_iniciado`: `title = "Checklists não iniciados"`, `orderField = "scheduled_time"` (com fallback para `created_at` se a coluna não existir).
- Atualizar texto de estado vazio para incluir o caso "Nenhum checklist não iniciado neste dia."
- Para `nao_iniciado`, ocultar timestamp (não há `started_at`/`completed_at`) e ocultar o accordion de itens (não há respostas) — renderizar apenas a linha do checklist com setor/operador/horário agendado, sem `AccordionTrigger` expansível.

### 2. `src/components/pdv/checklists/DashboardPanel.tsx`
- Adicionar estado `notStartedDialogOpen`.
- Tornar o `MetricCard` "Não Iniciados" clicável passando `onClick={() => setNotStartedDialogOpen(true)}`.
- Renderizar um terceiro `<CompletedExecutionsDialog>` com `status="nao_iniciado"`.

## Notas

- Sem mudanças de banco; usa o mesmo filtro `status` na query existente.
- Mantém o padrão de UX e cores neutras já adotado no painel.
