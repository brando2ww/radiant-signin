

## Tipos de Perguntas nas Avaliações: Estrelas, Múltipla Escolha e Pesquisa

### Situação Atual
Hoje as perguntas só suportam um tipo: **estrelas (1-5)**. A tabela `evaluation_campaign_questions` não tem campo de tipo, e `evaluation_answers` só armazena `score` (number) e `comment` (text).

### Mudanças Propostas

**1. Migration: Adicionar suporte a tipos de pergunta**

Na tabela `evaluation_campaign_questions`:
- Novo campo `question_type` (text, default `'stars'`) — valores: `stars`, `multiple_choice`, `single_choice`
- Novo campo `options` (jsonb, nullable) — array de opções para perguntas de escolha, ex: `["Instagram", "Indicação", "Google", "Passou na frente"]`

Na tabela `evaluation_answers`:
- Novo campo `selected_options` (jsonb, nullable) — armazena as opções escolhidas pelo cliente (array de strings)
- O campo `score` existente continua para perguntas de estrelas; será `0` para perguntas de escolha

**2. CampaignQuestionManager — Interface de criação**

Ao adicionar pergunta, o usuário escolhe o tipo:
- **Estrelas** (padrão) — funciona como hoje
- **Escolha única** — ex: "Como conheceu nosso restaurante?" com opções configuráveis
- **Múltipla escolha** — ex: "O que mais gostou?" com seleção de várias opções

Para tipos de escolha, aparece um sub-formulário para adicionar/remover opções (chips editáveis).

Template atualizado com pergunta "Como conheceu o restaurante?" pré-configurada como escolha única.

**3. PublicEvaluation — Renderização por tipo**

No formulário público, cada pergunta renderiza conforme o tipo:
- `stars` → estrelas clicáveis (como hoje)
- `single_choice` → radio buttons estilizados
- `multiple_choice` → checkboxes estilizados

**4. Hooks e Dashboard — Leitura dos novos campos**

- `use-evaluation-campaigns.ts`: incluir `question_type` e `options` no fetch/create
- `use-customer-evaluations.ts`: incluir `selected_options` nas respostas
- Dashboard/Reports: exibir distribuição de respostas para perguntas de escolha (gráfico de barras com contagem por opção)

### Arquivos alterados/criados
1. **Migration SQL** — `question_type`, `options` em questions; `selected_options` em answers
2. **`CampaignQuestionManager.tsx`** — seletor de tipo + editor de opções
3. **`PublicEvaluation.tsx`** — renderização condicional por tipo
4. **`use-evaluation-campaigns.ts`** — tipos e queries atualizados
5. **`use-customer-evaluations.ts`** — incluir `selected_options`

