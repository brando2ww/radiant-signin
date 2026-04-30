## Objetivo
Quando o usuário clicar no olho (👁) de um cliente nas listas que abrem a partir dos cards do Dashboard de Avaliações (Promotores, Neutros, Detratores), mostrar **cada pergunta com a resposta em estrelas (0-5)** — exatamente como no modal "Detalhes da Avaliação" da tela Campanhas > Respostas (screenshot 3) — em vez do timeline atual que só mostra NPS médio e comentários.

## Estado atual
- Cards Promotores/Neutros/Detratores → abrem `NPSDetailDialog` (lista de pessoas com olho). ✅
- Olho na linha → abre `ClientDetailDialog` que hoje mostra apenas: dados do cliente, NPS médio, e timeline de avaliações com badge de NPS + comentários gerais. ❌ Não mostra cada pergunta + estrelas.
- A tela Campanhas (`CampaignResponses.tsx`, linhas 147-216) já tem o modal certo: lista cada pergunta com 5 estrelas preenchidas conforme `answer.score`, mais comentário individual.
- Os textos das perguntas já estão disponíveis via `useEvaluationQuestionTexts()` (mapa `question_id → texto`), inclusive cobrindo perguntas legadas e de campanhas.

## O que será feito

### 1. Reescrever a parte de "Histórico" do `ClientDetailDialog.tsx`
Manter o cabeçalho (nome, WhatsApp, aniversário, NPS médio, botão WhatsApp) — está bom.

Substituir o bloco de timeline (linhas 86-145) por uma nova seção "Avaliações detalhadas" que, para cada avaliação do cliente, renderiza:
- Cabeçalho compacto com data/hora + badge NPS (já existe, manter).
- Lista das perguntas respondidas, no mesmo padrão visual da tela Campanhas:
  - Texto da pergunta (resolvido via `questionTexts.get(answer.question_id)`).
  - 5 estrelas (`Star` do lucide), preenchidas em âmbar até `answer.score`, vazias depois.
  - Texto `{score}/5`.
  - Comentário individual da resposta, se houver, em bloco `bg-muted/50` com ícone `MessageSquare`.
- Comentário geral do NPS (`nps_comment`) em destaque, se existir.

Reaproveitar a marcação JSX usada em `CampaignResponses.tsx` linhas 182-205 para manter consistência visual.

### 2. Trazer os textos das perguntas para o componente
- Em `ClientDetailDialog.tsx` chamar `useEvaluationQuestionTexts()` (já existe em `src/hooks/use-evaluation-report-helpers.ts`) e usar o `Map` retornado para resolver cada `question_id`. Fallback: "Pergunta não encontrada".
- Não é preciso mudar `useCustomerEvaluations` — os IDs já vêm; só falta traduzir.

### 3. Ajustes finos
- Aumentar levemente a altura útil do scroll interno (atualmente `maxHeight: 300`) para algo como `maxHeight: 480`, já que cada avaliação agora ocupa mais espaço.
- Manter botão "Enviar mensagem" (WhatsApp) e o card-resumo no topo.
- Remover a duplicação visual: badge `NPS X` já existe; manter, e mostrar apenas uma vez por avaliação.

### 4. O que NÃO será alterado
- `NPSDetailDialog.tsx` (a lista intermediária está correta).
- `DashboardKPICards.tsx` (cards Promotores/Neutros/Detratores já são clicáveis; o usuário só pediu a fix das respostas detalhadas).
- Nenhuma migration de banco.

## Detalhes técnicos
- Arquivo editado: `src/components/evaluations/dashboard/../../pdv/evaluations/ClientDetailDialog.tsx` (caminho real: `src/components/pdv/evaluations/ClientDetailDialog.tsx`).
- Imports adicionais: `useEvaluationQuestionTexts` de `@/hooks/use-evaluation-report-helpers`.
- Mantém `EvaluationWithAnswers` como tipo; `evaluation_answers` já contém `{id, question_id, score, comment}`.
- Padrão visual segue o já existente em `CampaignResponses.tsx` para garantir paridade exata com a tela Campanhas.

## Critério de aceitação
- Clicar em "Detratores" (ou Neutros/Promotores) no Dashboard → lista de pessoas.
- Clicar no olho de uma pessoa → abre o `ClientDetailDialog` exibindo, para cada avaliação dela, a lista de perguntas com estrelas preenchidas (ex.: "Como você avalia o nosso AMBIENTE? ★★★★★ 5/5"), igual ao screenshot 3.
- Comentários por pergunta e comentário geral de NPS aparecem quando existem.