## Objetivo

Manter um único QR Code (como hoje), mas garantir que cada operador, ao logar com o PIN, veja **apenas os checklists do setor dele**. Líderes e gestores enxergam todos os setores.

## Comportamento atual

- `TaskQRCodeDialog` já gera um QR único — fica como está.
- `fetchAssignedSchedules` já filtra por `assigned_sector === operatorSector`, **mas** existe um caso aberto: schedules sem `assigned_operator_id` e sem `assigned_sector` são exibidos para qualquer operador (linha 81 do hook). Isso deixa cozinha vendo checklists do bar e vice-versa.
- Não há distinção para líder/gestor: todos sofrem o filtro do próprio setor.

## Mudanças

### 1. `src/hooks/use-checklist-execution.ts` — Reforçar filtro por setor

Em `fetchAssignedSchedules(operatorId, operatorSector, accessLevel?)`:

- Adicionar parâmetro opcional `accessLevel`.
- Se `accessLevel` for `lider` ou `gestor`: ignorar filtro de setor/operador e retornar todos os schedules ativos do dia.
- Caso contrário, exigir match estrito:
  - aceitar se `assigned_operator_id === operatorId`, **OU**
  - aceitar se `assigned_sector === operatorSector`, **OU**
  - aceitar se o schedule não tem operador/setor atribuído **mas** o setor do checklist (`checklists.sector`) for igual ao do operador.
- Schedules sem nenhuma vinculação e cujo `checklists.sector` não bate com o do operador deixam de aparecer.

### 2. `src/pages/PublicTasks.tsx` — Passar `access_level` no fetch

Atualizar a chamada `fetchAssignedSchedules(op.id, op.sector)` para `fetchAssignedSchedules(op.id, op.sector, op.access_level)` em `loadSchedules`.

Pequeno ajuste no header da tela: mostrar o setor do operador (ex.: "Cozinha") para reforçar o contexto, ou "Todos os setores" quando for líder/gestor.

### 3. `src/components/pdv/tasks/TaskQRCodeDialog.tsx` — Texto explicativo

Atualizar a mensagem para deixar claro o comportamento: "Imprima e cole na cozinha. Cada colaborador só verá os checklists do próprio setor após digitar o PIN. Líderes e gestores veem todos." Sem mudanças funcionais.

## Arquivos editados

- `src/hooks/use-checklist-execution.ts`
- `src/pages/PublicTasks.tsx`
- `src/components/pdv/tasks/TaskQRCodeDialog.tsx`

## Resultado

- Operador da cozinha digita PIN → vê só checklists da cozinha.
- Operador do bar digita PIN no mesmo dispositivo → vê só checklists do bar.
- Líder/gestor digita PIN → vê todos os checklists do dia, de todos os setores.
