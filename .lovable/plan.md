

## Página "Avaliações" com Campanhas + Link Público

### Conceito

Criar um sistema de **campanhas de avaliação**. Cada campanha agrupa perguntas, gera um QR code/link público, e armazena todas as respostas. O link público coleta nome, telefone e data de nascimento antes das perguntas. Se a nota de uma pergunta for baixa (1-2), abre campo de comentário.

### Banco de Dados

**Nova tabela `evaluation_campaigns`:**
- `id`, `user_id`, `name`, `description`, `is_active`, `created_at`, `updated_at`

**Nova tabela `evaluation_campaign_questions`:**
- `id`, `campaign_id` (FK), `question_text`, `order_position`, `is_active`

**Alterar `customer_evaluations`:**
- Adicionar coluna `campaign_id` (FK nullable para retrocompatibilidade)

**Alterar `evaluation_answers`:**
- Adicionar coluna `comment` (text nullable) — para quando a nota é baixa

RLS: campanhas visíveis pelo dono (`user_id = auth.uid()`). Respostas públicas permitem INSERT anônimo (como já funciona com `customer_evaluations`). A página pública de campanha lê perguntas da campanha sem autenticação.

### Rota Pública

`/avaliacao/:campaignId` — página pública (sem login) que:
1. Busca a campanha e suas perguntas
2. Coleta nome, telefone, data de nascimento
3. Mostra cada pergunta com escala 1-5 (estrelas)
4. Se nota <= 2, abre textarea "O que aconteceu?"
5. Envia tudo para o banco

### Página Admin (PDV)

Rota `/pdv/avaliacoes` com:

**Aba Campanhas:**
- Lista de campanhas criadas
- Botão "Nova Campanha" → dialog com nome e descrição
- Cada campanha mostra: nome, status (ativa/inativa), total de respostas, QR code
- Ao clicar na campanha → detalhe com:
  - Gerenciador de perguntas (criar, editar, reordenar, ativar/desativar)
  - Link público + QR code
  - Lista de respostas recebidas com dados do cliente e notas
  - Estatísticas (média por pergunta, NPS, total)

### Arquivos

| Arquivo | Ação |
|---------|------|
| **Migração SQL** | Criar `evaluation_campaigns`, `evaluation_campaign_questions`, adicionar `campaign_id` em `customer_evaluations`, `comment` em `evaluation_answers` + RLS |
| `src/hooks/use-evaluation-campaigns.ts` | **Criar** — CRUD de campanhas e perguntas de campanha |
| `src/pages/pdv/Evaluations.tsx` | **Criar** — Página principal com lista de campanhas + detalhe |
| `src/components/pdv/evaluations/CampaignCard.tsx` | **Criar** — Card de campanha com stats e QR |
| `src/components/pdv/evaluations/CampaignDialog.tsx` | **Criar** — Dialog para criar/editar campanha |
| `src/components/pdv/evaluations/CampaignDetail.tsx` | **Criar** — Detalhe com perguntas, link, respostas |
| `src/components/pdv/evaluations/CampaignQuestionManager.tsx` | **Criar** — Gerenciar perguntas da campanha |
| `src/components/pdv/evaluations/CampaignResponses.tsx` | **Criar** — Lista de respostas com filtros |
| `src/pages/PublicEvaluation.tsx` | **Criar** — Página pública `/avaliacao/:campaignId` |
| `src/App.tsx` | Adicionar rota `/avaliacao/:campaignId` (pública) |
| `src/pages/PDV.tsx` | Adicionar rota `avaliacoes` e `avaliacoes/:id` |
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar "Avaliações" na seção Administrador com ícone `Star` |

### Fluxo do Link Público

```text
1. Cliente escaneia QR → /avaliacao/abc123
2. Tela: "Olá! Conte-nos sobre sua experiência"
3. Formulário: Nome, Telefone (máscara), Data de Nascimento
4. Botão "Continuar"
5. Perguntas uma a uma ou todas juntas com estrelas 1-5
6. Se nota <= 2: "O que aconteceu?" (textarea)
7. Botão "Enviar Avaliação"
8. Tela de agradecimento
```

