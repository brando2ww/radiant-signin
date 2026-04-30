## Objetivo
Tornar o card **"Total de Respostas"** do Dashboard clicável e abrir a mesma lista que já abre para Promotores/Neutros/Detratores — só que mostrando **todas as avaliações do período**, sem filtro de NPS. Ao clicar no olho de cada linha, segue abrindo o `ClientDetailDialog` (que agora já mostra as respostas com estrelas, igual a Campanhas > Respostas).

## Alterações

### 1. `src/components/evaluations/dashboard/NPSDetailDialog.tsx`
- Adicionar `"all"` ao tipo `NpsCategory`.
- Adicionar entrada no `categoryConfig`:
  ```ts
  all: { label: "Todas as Respostas", icon: Eye, color: "text-foreground", scoreLabel: "Todas" }
  ```
- Ajustar o `useMemo` `filtered`: quando `category === "all"`, retornar todas as `evaluations` (sem o filtro `if (e.nps_score == null) return false` nem o filtro por faixa). Manter a busca por nome/telefone.
- Ajustar a coluna "NPS" da tabela: quando `nps_score` for `null` (avaliação sem NPS), mostrar `—` em vez de quebrar o estilo.

### 2. `src/components/evaluations/dashboard/DashboardKPICards.tsx`
- Trocar a prop `onNpsClick?: (category: "promoters" | "neutrals" | "detractors") => void` por `onCardClick?: (category: "promoters" | "neutrals" | "detractors" | "all") => void` (mantendo `onNpsClick` como alias deprecated para não quebrar nada, ou apenas renomeando — `EvaluationsDashboard` é o único consumidor).
- No card "Total de Respostas" (linhas 107-115): adicionar `cursor-pointer hover:shadow-md transition-shadow` e `onClick={() => onCardClick?.("all")}`.
- Manter "Cadastros únicos", "Cupons Gerados" e "Cupons Utilizados" como estão (você pediu apenas Total de Respostas).

### 3. `src/pages/evaluations/EvaluationsDashboard.tsx`
- Renomear o handler atual `onNpsClick={setNpsFilter}` para `onCardClick={setNpsFilter}` (o tipo `NpsCategory` já vai aceitar `"all"` por causa da mudança em #1).
- Nada mais muda — o `NPSDetailDialog` já recebe `evaluations` e abre o `ClientDetailDialog` ao clicar no olho.

## Critério de aceitação
- Card "Total de Respostas" fica clicável (com hover).
- Ao clicar, abre o mesmo diálogo de listagem mostrando **todas** as avaliações do período (incluindo as sem NPS), buscáveis por nome/telefone.
- Olho em cada linha abre o detalhe com perguntas + estrelas, igual ao que já funciona para Promotores/Neutros/Detratores.

Posso aplicar?