## Problema

O usuário confirmou que respostas de **múltipla escolha** (e outros tipos não-estrela) ainda estão sendo contabilizadas em outros relatórios e influenciando o NPS por pergunta / médias / distribuição de notas em **todos** os painéis de avaliação, não só na aba Relatórios da campanha.

A correção anterior tratou apenas `CampaignReports.tsx`. Os demais relatórios (Dashboard geral, Relatório Diário, Semanal, Mensal, e helpers compartilhados) continuam somando `evaluation_answers.score` indiscriminadamente.

## Causa raiz

`EvaluationAnswer` não carrega o `question_type`. Cada consumidor agrega `.score` sem saber se a resposta veio de uma pergunta de nota (stars 1-5) ou de múltipla escolha / texto. Como respostas não-stars normalmente vêm com `score = 0` ou valor sem semântica de nota, elas:

- puxam médias de satisfação para baixo
- inflam contagem de "detratores" no NPS por pergunta
- aparecem no gráfico de "Distribuição de Notas"
- contam como resposta válida em "Médias por dia da semana / faixa etária / horário"
- contaminam o CSV exportado

## Solução central — enriquecer na fonte

Modificar **`src/hooks/use-customer-evaluations.ts`** para anexar `question_type` em cada `evaluation_answer` no momento da query. Como apenas `evaluation_campaign_questions` tem tipos diferentes de stars (perguntas legacy em `evaluation_questions` são sempre stars), basta um lookup paralelo:

```ts
async function fetchQuestionTypeMap(): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("evaluation_campaign_questions")
    .select("id, question_type");
  const map = new Map<string, string>();
  (data || []).forEach((q: any) => map.set(q.id, q.question_type || "stars"));
  return map;
}
```

E expor um helper canônico:

```ts
export const isStarsAnswer = (a: { question_type?: string }) =>
  (a?.question_type || "stars") === "stars";
```

Cada `EvaluationAnswer` retornado passa a ter `question_type` preenchido (default `"stars"` para perguntas legacy).

## Aplicar `isStarsAnswer` em todos os agregadores

Todos os locais abaixo passam a filtrar `.filter(isStarsAnswer)` antes de somar `.score`:

### `src/hooks/use-customer-evaluations.ts` — `useEvaluationStats`
- `allScores` (média geral de satisfação)
- `satisfactionByAge` — média por faixa etária
- `weekdayStats` — média por dia da semana
- `recentNegative` — alertas de média < 3
- `vipCustomers.avgScore`
- `questionStats` — pular perguntas não-stars inteiras (não devem aparecer no "questionAverages")
- `dailyData.scores` — evolução diária de satisfação

### `src/hooks/use-customer-evaluations.ts` — `useExportEvaluations`
- coluna "Média Geral" do CSV

### `src/pages/evaluations/EvaluationsDashboard.tsx`
- `criteriaStats` (NPS por critério/pergunta) — pular perguntas não-stars; aplicar filtro nas respostas

### `src/pages/pdv/evaluations/reports/ReportDaily.tsx`
- `tableData.avgScore`
- `negativeAlerts.avgScore`

### `src/pages/pdv/evaluations/reports/ReportWeekly.tsx`
- `calcStats.allScores` (média de satisfação semanal)
- `evolutionData.scores` (evolução de 14 dias)

### `src/pages/pdv/evaluations/reports/ReportMonthly.tsx`
- `allScores` que alimenta `scoreDistribution` (1–5 estrelas)

### `src/components/evaluations/reports/NpsPerQuestion.tsx`
- ignorar respostas/perguntas não-stars (NPS por pergunta só faz sentido para escala 1-5)

### `src/components/pdv/evaluations/ClientDetailDialog.tsx`
- `avgScore` por avaliação no histórico do cliente — usar `isStarsAnswer` (já existe lógica via `questionInfo`, mas o helper canônico vindo do dado fica mais simples e consistente)

### `src/components/evaluations/dashboard/RecentResponsesTable.tsx`
- conferir agregações que envolvam score (apenas filtros de comentário hoje, mas verificar)

## NPS principal — não muda

O NPS geral (KPI) já é calculado a partir de `customer_evaluations.nps_score` (0-10), campo separado dos `evaluation_answers`. Esse cálculo continua intocado.

## Fluxo de dados

```text
useCustomerEvaluations
    │
    ├── select customer_evaluations + evaluation_answers
    ├── select evaluation_campaign_questions (id, question_type)
    └── enriquece cada answer com question_type
            │
            ▼
    EvaluationWithAnswers (já com question_type por resposta)
            │
   ┌────────┼────────────────┬──────────────────┬────────────────┐
   ▼        ▼                ▼                  ▼                ▼
useEvaluationStats  EvaluationsDashboard  ReportDaily/Weekly/Monthly  NpsPerQuestion
   │                    (filtra com isStarsAnswer em todos)
   ▼
DashboardKPICards / Suggestions / etc.
```

## Arquivos a alterar

- `src/hooks/use-customer-evaluations.ts` (fonte + helpers + `useEvaluationStats` + `useExportEvaluations`)
- `src/pages/evaluations/EvaluationsDashboard.tsx`
- `src/pages/pdv/evaluations/reports/ReportDaily.tsx`
- `src/pages/pdv/evaluations/reports/ReportWeekly.tsx`
- `src/pages/pdv/evaluations/reports/ReportMonthly.tsx`
- `src/components/evaluations/reports/NpsPerQuestion.tsx`
- `src/components/pdv/evaluations/ClientDetailDialog.tsx` (alinhar ao helper canônico)

Sem migrações de banco — tudo em código.

## Resultado esperado

- "Média de Satisfação", "Distribuição de Notas", "NPS por Pergunta", "Evolução da Satisfação", "Alertas Negativos", médias por horário/faixa etária, ranking VIP e CSV exportado passam a refletir **apenas** respostas de perguntas de nota.
- Perguntas de múltipla escolha continuam visíveis nos detalhes individuais da avaliação (`ClientDetailDialog`, `CampaignResponses`), mas não entram em nenhum cálculo agregado.
- NPS geral (campo `nps_score`) permanece inalterado, como esperado.
