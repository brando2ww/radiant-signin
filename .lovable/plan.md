## Problema

No relatório da campanha (`/pdv/avaliacoes/campanhas` → aba Relatórios), os gráficos **Média Geral**, **Distribuição de Notas** e **Média por Pergunta** estão considerando TODAS as respostas — inclusive as de perguntas de múltipla escolha (`multiple_choice`, `single_choice`, `text`, etc.), que não têm nota de 1-5.

Como essas respostas têm `score = 0` (ou valores não comparáveis a estrelas), elas:
- Puxam a média geral para baixo
- Aparecem em vermelho (detrator) no gráfico "Média por Pergunta"
- Inflam a contagem na "Distribuição de Notas"

O componente `CampaignResponses.tsx` já trata isso corretamente, filtrando por `question_type === "stars"`. O bug está isolado em `CampaignReports.tsx`.

## Solução

Editar **`src/components/pdv/evaluations/CampaignReports.tsx`** para considerar apenas respostas de perguntas do tipo `stars` nos três cálculos numéricos:

1. **`allScores`** (média geral + distribuição de notas) — filtrar `a.question_type === "stars"` (default `"stars"` quando ausente, mantendo retrocompatibilidade).

2. **`avgPerQuestion`** — pular perguntas cujo `question_type` não seja `"stars"`. Múltipla escolha não entra no gráfico de média (ou pode aparecer com indicador "n/a", mas o mais limpo é simplesmente ocultá-las).

3. **`scoreDist`** — usar o mesmo `allScores` já filtrado.

O NPS continua usando `nps_score` (campo separado), então não é afetado.

### Snippet das mudanças (em `CampaignReports.tsx`)

```typescript
// Helper: respostas que são notas (1-5)
const isStars = (a: any) => (a.question_type || "stars") === "stars";

// Média geral
const allScores = responses.flatMap((r) =>
  (r.evaluation_answers as any[]).filter(isStars).map((a: any) => a.score)
);

// Média por pergunta — só perguntas tipo "stars"
const avgPerQuestion = (questions || [])
  .filter((q: any) => (q.question_type || "stars") === "stars")
  .map((q) => {
    const scores: number[] = [];
    responses.forEach((r) => {
      const ans = (r.evaluation_answers as any[])?.find(
        (a: any) => a.question_id === q.id && isStars(a)
      );
      if (ans) scores.push(ans.score);
    });
    // ...resto igual
  });
```

`scoreDist` permanece como está, pois deriva de `allScores` (já filtrado).

## Arquivos alterados

- `src/components/pdv/evaluations/CampaignReports.tsx`

## Resultado esperado

- "Média geral", "Distribuição de Notas" e "Média por Pergunta" passam a refletir apenas perguntas de nota (estrelas).
- As perguntas "Como você conheceu o Kōten?" e "Com base na sua experiência, o que..." (múltipla escolha) deixam de aparecer em vermelho como detratoras no gráfico — elas simplesmente não entram nesse gráfico.
- NPS, contagem total de respostas e demais painéis continuam inalterados.
