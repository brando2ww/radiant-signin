

## Melhorias na Campanha de Avaliação: Templates, NPS e Relatórios

### Mudanças

**1. Templates de perguntas para restaurantes**
Botão "Importar Template" no `CampaignQuestionManager` que insere perguntas pré-definidas para o nicho de restaurante (ex: "Como avalia a qualidade da comida?", "O atendimento foi satisfatório?", "O ambiente estava agradável?", "O tempo de espera foi adequado?", "A relação custo-benefício foi justa?").

**2. NPS no final da pesquisa pública**
Após responder todas as perguntas, adicionar uma etapa "NPS" perguntando: "De 0 a 10, o quanto você indicaria nosso estabelecimento para um amigo?". Salvar o valor no campo `nps_score` da tabela `customer_evaluations` (já existe).

**3. Relatórios na campanha**
Trocar as 2 tabs atuais (Perguntas, Respostas) por 3 tabs: **Perguntas**, **Respostas** e **Relatórios**. A tab Relatórios terá:
- **Relatório de Respostas**: média por pergunta (gráfico de barras), total de respostas por dia (gráfico de linha), distribuição de notas
- **Relatório NPS**: score NPS calculado (promotores 9-10, neutros 7-8, detratores 0-6), gauge/indicador visual, evolução do NPS ao longo do tempo

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/evaluations/CampaignQuestionManager.tsx` | Adicionar botão "Importar Template" com perguntas pré-definidas de restaurante |
| `src/components/pdv/evaluations/CampaignDetail.tsx` | Adicionar tab "Relatórios" com sub-seções Respostas e NPS |
| `src/components/pdv/evaluations/CampaignReports.tsx` | **Criar** — Componente de relatórios com gráficos de média por pergunta, distribuição de notas, e painel NPS |
| `src/pages/PublicEvaluation.tsx` | Adicionar step "nps" entre "questions" e "done" com escala 0-10 e salvar no campo `nps_score` |
| `src/hooks/use-evaluation-campaigns.ts` | Atualizar `useSubmitCampaignEvaluation` para aceitar `npsScore` e salvar em `customer_evaluations.nps_score` |

### Fluxo público atualizado

```text
1. Info (nome, telefone, nascimento)
2. Perguntas (estrelas 1-5 + comentário se nota baixa)
3. NPS: "De 0 a 10, indicaria nosso estabelecimento?" (botões 0-10)
4. Enviar → Tela de agradecimento
```

### Cálculo NPS
- Promotores: notas 9-10
- Neutros: notas 7-8
- Detratores: notas 0-6
- NPS = % Promotores - % Detratores (resultado de -100 a +100)

### Templates de restaurante (pré-definidos)
1. "Como avalia a qualidade da comida?"
2. "O atendimento foi satisfatório?"
3. "O ambiente estava agradável?"
4. "O tempo de espera foi adequado?"
5. "A relação custo-benefício foi justa?"
6. "A higiene do local estava adequada?"

