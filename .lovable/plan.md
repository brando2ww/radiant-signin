

## Melhorias: Relatórios de Avaliação + Respostas com Modal

### Problemas

1. **"Pergunta removida"** — A query `useCampaignResponses` não faz join com `evaluation_campaign_questions`, então o texto da pergunta nunca vem. Precisa incluir o join no select.
2. **Respostas abertas** — Todas as respostas ficam listadas expandidas. Com muitos respondentes, fica inviável. Precisa virar tabela paginada com modal de detalhes.
3. **Graficos ruins** — Charts sem cores adequadas, sem gradientes, sem formatação de valores, sem cards de resumo complementares.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-evaluation-campaigns.ts` | Adicionar join com `evaluation_campaign_questions` na query de responses |
| `src/components/pdv/evaluations/CampaignResponses.tsx` | Reescrever: tabela paginada de respondentes + modal com detalhes completos |
| `src/components/pdv/evaluations/CampaignReports.tsx` | Melhorar graficos: cores, gradientes, tooltips formatados, cards de resumo, distribuicao de notas, satisfacao media |

### Detalhes

**1. Fix do join (`use-evaluation-campaigns.ts`)**

Alterar a query para incluir o texto da pergunta:
```sql
evaluation_answers (
  id, question_id, score, comment,
  evaluation_campaign_questions (
    question_text
  )
)
```

**2. Respostas em tabela (`CampaignResponses.tsx`)**

- Tabela com colunas: Nome, WhatsApp, NPS, Media, Data
- Paginacao local (10 por pagina)
- Busca por nome/telefone
- Ao clicar na linha, abre `Dialog` com:
  - Dados do cliente (nome, whatsapp, data nascimento)
  - NPS score com badge colorida
  - Cada pergunta com nota em estrelas e comentario
  - Data/hora da resposta

**3. Graficos melhores (`CampaignReports.tsx`)**

- NPS: donut chart com innerRadius, cores verde/amarelo/vermelho reais, gauge visual
- Cards de resumo no topo: Total respostas, Media geral, NPS Score, Taxa de promotores
- Media por pergunta: barras com gradiente, labels com nota ao lado da barra, cores baseadas na nota (verde >4, amarelo >3, vermelho <=3)
- Respostas por dia: area chart com gradiente ao inves de line chart simples
- Novo: Distribuicao de notas (1-5 estrelas) em bar chart vertical
- Tooltips formatados em portugues

