

## Melhorias na Avaliação: Perguntas Step-by-Step, Personalização, e Leads

### 1. Perguntas Step-by-Step no Link Público

Atualmente todas as perguntas aparecem na mesma tela. Mudar para exibir **uma pergunta por vez** com indicador de progresso (ex: "Pergunta 2 de 6") e animação de transição.

### 2. Personalização Visual da Pesquisa

Adicionar uma nova tab "Personalização" dentro do detalhe da campanha (`CampaignDetail`), onde o dono pode configurar:
- **Logotipo** — upload de imagem (bucket `business-logos`)
- **Cor de fundo** — color picker para o background da pesquisa
- **Mensagem de boas-vindas** — texto customizável
- **Mensagem de agradecimento** — texto final customizável

Esses campos serão colunas novas na tabela `evaluation_campaigns`:
- `logo_url text`
- `background_color text DEFAULT '#ffffff'`
- `welcome_message text`
- `thank_you_message text`

A página pública lê esses dados e aplica o estilo dinamicamente.

### 3. Página de Leads Captados

Nova tab "Leads" dentro do detalhe da campanha, mostrando uma tabela com todos os clientes que responderam:
- Nome, Telefone, Data de Nascimento, Data da resposta, NPS
- Possibilidade de exportar (futuro)

Também adicionar na página principal de Avaliações uma visão geral de leads (ou acessar via tab na campanha).

### Banco de Dados

Migração para adicionar colunas de personalização em `evaluation_campaigns`:
```sql
ALTER TABLE public.evaluation_campaigns
  ADD COLUMN logo_url text,
  ADD COLUMN background_color text DEFAULT '#ffffff',
  ADD COLUMN welcome_message text,
  ADD COLUMN thank_you_message text;
```

### Arquivos

| Arquivo | Acao |
|---------|------|
| **Migração SQL** | Adicionar `logo_url`, `background_color`, `welcome_message`, `thank_you_message` em `evaluation_campaigns` |
| `src/pages/PublicEvaluation.tsx` | Refatorar para step-by-step (1 pergunta por tela), aplicar logo/cor de fundo/mensagens personalizadas, design mais polido |
| `src/components/pdv/evaluations/CampaignDetail.tsx` | Adicionar tab "Personalização" e tab "Leads" |
| `src/components/pdv/evaluations/CampaignPersonalization.tsx` | **Criar** — Formulário de personalização: upload logo, color picker, mensagens |
| `src/components/pdv/evaluations/CampaignLeads.tsx` | **Criar** — Tabela de leads captados (nome, telefone, nascimento, data, NPS) |
| `src/hooks/use-evaluation-campaigns.ts` | Atualizar `usePublicCampaign` para retornar os novos campos; atualizar `useUpdateCampaign` |

### Fluxo Público Atualizado

```text
1. Tela inicial: Logo + mensagem de boas-vindas + nome/telefone/nascimento
2. Pergunta 1 de N (estrelas 1-5 + campo comentário se nota baixa)
3. Pergunta 2 de N ...
4. ...
5. NPS (0-10)
6. Tela de agradecimento com mensagem personalizada
```

Background e logo aplicados em todas as telas via estilo inline dinâmico.

### Tabs do Detalhe da Campanha (atualizado)

```text
Perguntas | Personalização | Leads | Respostas | Relatórios
```

