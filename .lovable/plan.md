## Diagnóstico

A tela `/tarefas/:userId` (acessada via PIN/QR) decide quais checklists a pessoa vê em `src/hooks/use-checklist-execution.ts → fetchAssignedSchedules`:

```ts
const isManager = accessLevel === "lider" || accessLevel === "gestor";
if (isManager) return true; // vê todos os schedules do dia
// senão filtra por assigned_operator_id → assigned_sector → checklists.sector
```

O cadastro de operador (`OperatorDrawer.tsx`) tem somente 3 valores possíveis para `access_level`:

- `operador` — só executa
- `lider` — executa e acompanha
- `gestor` — acesso total

A Louise é "gerente" no sentido humano, mas no cadastro de **Operador de Checklist** ela provavelmente está como `operador` (default ao criar) com setor `salao`. Com isso ela só enxerga checklists do setor salão (ex.: "Abertura de Salão"). Não é bug de RLS nem de schedule — é o `access_level` dela que não é `gestor`/`lider`.

Confirmação rápida via SQL (faço durante a implementação):

```sql
SELECT name, sector, access_level, is_active
FROM checklist_operators
WHERE name ILIKE '%louise%';
```

## O que vou fazer

### 1. Corrigir cadastro da Louise (e similares)
Atualizar o `access_level` da Louise para `gestor` (ela é gerente). Faço isso via migration pontual após confirmar o registro com SELECT.

### 2. Tornar o nível visível na UI de Operadores
Em `src/components/pdv/checklists/OperatorsManager.tsx` e nos cards (`OperatorCard.tsx`), exibir um **badge claro** com o nível ("Operador" / "Líder" / "Gestor") e o setor. Hoje o nível fica escondido — o gestor cadastra como "operador" sem perceber.

### 3. Aviso ao criar/editar operador
No `OperatorDrawer.tsx`, deixar o seletor de nível mais explícito (já existe, mas com cópia ambígua). Adicionar uma **dica visual** ao lado do nome: "Quem deve ver TODOS os checklists? Marque como Gestor."

### 4. Pequeno ajuste defensivo no filtro
Em `fetchAssignedSchedules`, normalizar o `access_level` (trim + lowercase) antes de comparar, para evitar regressões caso o valor venha com espaço/caixa diferente. Sem mudar a regra: `lider` e `gestor` continuam vendo tudo.

### 5. Mensagem na tela pública
Em `PublicTasks.tsx`, quando o operador for `operador` e a lista vier vazia, mostrar texto explicativo:

> "Nenhum checklist atribuído ao seu setor (X) hoje. Se você é responsável por outros setores, peça ao gestor para alterar seu nível de acesso."

## Arquivos afetados

- `src/hooks/use-checklist-execution.ts` — normalizar `accessLevel`
- `src/pages/PublicTasks.tsx` — mensagem contextual
- `src/components/pdv/checklists/OperatorsManager.tsx` / `team/OperatorCard.tsx` — badge de nível
- `src/components/pdv/checklists/team/OperatorDrawer.tsx` — dica visual
- 1 migration SQL pontual para promover a Louise a `gestor`

## Fora de escopo
Não vou alterar a regra "líder vê tudo" agora — embora discutível (líder normalmente é de um setor), mexer nisso pode quebrar outros operadores. Se quiser que líder veja só o próprio setor + agregado da equipe, abro como tarefa separada.

Aprove para implementar.