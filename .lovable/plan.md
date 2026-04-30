## Problema

Na visualização de detalhes de uma avaliação (tanto no Dashboard → ClientDetailDialog quanto em Campanhas → Respostas → CampaignResponses), todas as respostas estão sendo mostradas como estrelas de 1 a 5, mesmo quando a pergunta original era do tipo **Escolha única** (`single_choice`), **Múltipla escolha** (`multiple_choice`) ou outro tipo que não seja estrelas.

Isso acontece porque:
- Os componentes renderizam sempre o bloco de 5 estrelas baseado em `answer.score`.
- Não buscam `question_type` da pergunta nem `selected_options` da resposta.
- A coluna `evaluation_answers.selected_options` (Json) já existe no banco e guarda a opção/opções escolhidas, mas nunca é lida.

## Objetivo

Renderizar cada resposta de acordo com o tipo da pergunta:
- `stars` (padrão / NPS por pergunta) → manter as 5 estrelas atuais.
- `single_choice` → mostrar a opção escolhida como um Badge/texto.
- `multiple_choice` → mostrar a lista das opções escolhidas como Badges.
- (qualquer outro tipo futuro com texto livre cai num fallback de texto).

## Arquivos a alterar

### 1. `src/hooks/use-evaluation-report-helpers.ts`
- Atualizar `useEvaluationQuestionTexts` para retornar não só o texto, mas também `question_type` e `options` de cada pergunta.
- Renomear o retorno para um Map de `question_id → { text, type, options }` (mantendo retrocompatibilidade onde for usado só o texto).

### 2. `src/hooks/use-customer-evaluations.ts`
- Adicionar `selected_options` ao SELECT de `evaluation_answers` em `useCustomerEvaluations` e em `useExportEvaluations`.
- Estender a interface `EvaluationAnswer` com `selected_options?: string[] | null`.
- Para cálculos de média (NPS médio, avgScore por avaliação) ignorar respostas onde `score` é 0 e `selected_options` está preenchido (assim escolhas não distorcem a média de estrelas).

### 3. `src/hooks/use-evaluation-campaigns.ts`
- Em `useCampaignResponses`: incluir `selected_options` no select de answers, e enriquecer cada answer também com `question_type` e `options` (vindos de `evaluation_campaign_questions`).

### 4. `src/components/pdv/evaluations/ClientDetailDialog.tsx`
- Substituir o bloco fixo de 5 estrelas por um renderer condicional `<AnswerValue answer={answer} question={...} />`:
  - `stars` → 5 estrelas + `score/5`.
  - `single_choice` → 1 Badge com a opção (`selected_options[0]` ou fallback `score` se vazio).
  - `multiple_choice` → várias Badges com cada item de `selected_options`.
- Ajustar o cálculo de `avgScore` no header de cada avaliação para considerar apenas respostas do tipo `stars`.

### 5. `src/components/pdv/evaluations/CampaignResponses.tsx`
- Mesma troca do bloco de estrelas pelo renderer condicional, usando `answer.question_type`, `answer.options` e `answer.selected_options` agora disponíveis.
- Ajustar o cálculo de "Média geral" e "Média" da tabela para considerar apenas respostas do tipo `stars`.

### 6. (Opcional) Pequeno componente compartilhado
- Criar `src/components/evaluations/AnswerValue.tsx` com a lógica de renderização condicional, reutilizado pelos dois pontos acima, evitando duplicar código.

## Detalhes técnicos

- `selected_options` é `Json | null` no Postgres. Tratar como `string[]` ao ler, com guarda `Array.isArray(...)`.
- Quando `question_type !== "stars"` e `selected_options` vazio, exibir "—" em vez de 0 estrelas.
- Sem mudanças de schema necessárias — todas as colunas já existem.
- Sem mudanças no fluxo público de envio (`PublicEvaluation.tsx` já grava `selected_options` corretamente via `useSubmitCampaignEvaluation`).

## Resultado esperado

Ao abrir os detalhes de uma avaliação (Dashboard ou Campanhas → Respostas), cada pergunta aparecerá com a resposta exata dada pelo cliente:
- Estrelas reais quando for pergunta de estrelas.
- Texto/Badge da opção escolhida em single/multiple choice.
- Comentários continuam aparecendo abaixo como hoje.