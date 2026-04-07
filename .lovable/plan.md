

## Sugestão Automática para NPS Baixo + Exibição no Dashboard

### Problema
Quando o cliente dá uma nota NPS baixa (detrator: 0-6) ou neutra (7-8), não há campo para ele explicar o motivo. Essa informação é valiosa para melhoria do negócio.

### Solução

#### 1. Migração: Adicionar coluna `nps_comment` na tabela `customer_evaluations`
```sql
ALTER TABLE public.customer_evaluations
  ADD COLUMN nps_comment text;
```

#### 2. Formulário público (`src/pages/PublicEvaluation.tsx`)
- Adicionar estado `npsComment`
- Após o usuário selecionar NPS ≤ 8 (neutro ou detrator), exibir automaticamente um `Textarea` com animação fade-in:
  - Placeholder: "O que podemos melhorar?" 
  - Label: "Deixe uma sugestão (opcional)"
  - maxLength: 500
- Passar `npsComment` no `handleSubmit`

#### 3. Mutação de envio (`src/hooks/use-evaluation-campaigns.ts`)
- Adicionar `npsComment?: string` no tipo do `data`
- Incluir `nps_comment: data.npsComment || null` no insert de `customer_evaluations`

#### 4. Dashboard — Exibição dos comentários

**`src/hooks/use-customer-evaluations.ts`**
- Incluir `nps_comment` no select da query de avaliações
- Adicionar ao tipo `EvaluationWithAnswers`

**`src/components/evaluations/dashboard/RecentResponsesTable.tsx`**
- Exibir ícone de balão de comentário quando há `nps_comment`
- No detalhe/tooltip, mostrar o comentário NPS

**`src/components/pdv/evaluations/CampaignLeads.tsx`** (se aplicável)
- Mostrar coluna de sugestão NPS na listagem de leads

**Nova seção no Dashboard (`src/pages/evaluations/EvaluationsDashboard.tsx`)**
- Card "Sugestões de Detratores/Neutros" listando os comentários NPS mais recentes com nome do cliente, nota e data

### Arquivos alterados
1. **Migração SQL** — nova coluna `nps_comment`
2. **`src/pages/PublicEvaluation.tsx`** — textarea condicional após NPS ≤ 8
3. **`src/hooks/use-evaluation-campaigns.ts`** — incluir `nps_comment` no insert
4. **`src/hooks/use-customer-evaluations.ts`** — incluir `nps_comment` no select/tipo
5. **`src/components/evaluations/dashboard/RecentResponsesTable.tsx`** — exibir comentário NPS
6. **`src/pages/evaluations/EvaluationsDashboard.tsx`** — card de sugestões recentes

