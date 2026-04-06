

## Estrategia: Redirecionamento para Google Reviews (NPS 9-10)

### Conceito
Quando o cliente der nota 9 ou 10 no NPS, apos enviar a avaliacao, ele sera redirecionado automaticamente para avaliar no Google. O dono do estabelecimento configura o link do Google Reviews nas configuracoes.

### Implementacao

**1. Adicionar coluna `google_review_url` na tabela `business_settings`**
- Migration: `ALTER TABLE business_settings ADD COLUMN google_review_url text;`
- Campo opcional — se nao estiver preenchido, o fluxo continua como hoje

**2. Configuracoes (`src/pages/evaluations/EvaluationsSettings.tsx`)**
- Novo card "Avaliacao Google" com:
  - Campo de input para o link do Google Reviews
  - Icone do Google e instrucoes de como encontrar o link
  - Salvar junto com as demais configuracoes via `saveSettings`
- Adicionar estado `googleReviewUrl` e incluir no `useEffect` e `handleSavePersonalization`

**3. Hook `use-business-settings.ts`**
- Adicionar `google_review_url` ao tipo `BusinessSettings`
- Incluir no select e no upsert

**4. Fluxo publico (`src/pages/PublicEvaluation.tsx`)**
- Ler `google_review_url` de `businessSettings`
- Na fase "done": se NPS >= 9 e `google_review_url` existir, mostrar tela especial com:
  - Mensagem de agradecimento + "Ficariamos muito felizes com sua avaliacao no Google!"
  - Botao "Avaliar no Google" que abre o link em nova aba
  - Botao secundario "Pular" para quem nao quiser
- Se NPS < 9 ou link nao configurado: fluxo normal (tela de agradecimento atual)

### Arquivos alterados
1. **Migration SQL** — adicionar `google_review_url` a `business_settings`
2. **`src/hooks/use-business-settings.ts`** — tipo + select/upsert
3. **`src/pages/evaluations/EvaluationsSettings.tsx`** — card de configuracao do link Google
4. **`src/pages/PublicEvaluation.tsx`** — logica de redirecionamento na fase "done"

