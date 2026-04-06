

## Melhorar Página de Campanhas

### Problema
A página atual é muito básica: apenas um grid de cards simples com nome, badge de status, contagem de respostas e data. Sem métricas visuais, sem ações rápidas, sem indicadores de desempenho.

### Melhorias Propostas

**1. Cards de campanha enriquecidos (`CampaignCard.tsx`)**
- Mini barra de progresso mostrando NPS médio da campanha (verde/amarelo/vermelho)
- Ícone de QR code com tooltip "Copiar link"
- Botão de ações rápidas (menu dropdown): Editar, Copiar link, Desativar, Excluir
- Indicador visual de "última resposta há X tempo" (ex: "Última resposta há 2h")
- Contagem de perguntas configuradas
- Hover com elevação mais pronunciada e borda sutil

**2. KPI cards no topo da página (`EvaluationsCampaigns.tsx` e `Evaluations.tsx`)**
- Total de campanhas ativas
- Total de respostas (todas as campanhas)
- NPS médio geral
- Exibidos em cards compactos acima do grid

**3. Filtros e busca**
- Campo de busca por nome de campanha
- Filtro por status (Todas / Ativas / Inativas)
- Ordenação (Mais recentes / Mais respostas / Alfabética)

**4. Empty state melhorado**
- Ícone maior e mais expressivo (Megaphone)
- Texto explicativo mais detalhado com bullet points de funcionalidades
- CTA mais destacado

**5. Menu de ações na campanha (novo componente `CampaignActions`)**
- DropdownMenu com: Copiar link, Ver QR Code, Ativar/Desativar, Excluir
- Confirmação antes de excluir (AlertDialog)

### Arquivos alterados
1. **`src/components/pdv/evaluations/CampaignCard.tsx`** — card enriquecido com NPS, ações, timestamps
2. **`src/pages/evaluations/EvaluationsCampaigns.tsx`** — KPI cards, filtros, busca, empty state
3. **`src/pages/pdv/Evaluations.tsx`** — mesmas melhorias (versão PDV da mesma página)
4. **`src/hooks/use-evaluation-campaigns.ts`** — adicionar `avg_nps`, `last_response_at`, `question_count` ao `CampaignWithStats`

### Detalhes técnicos
- O `avg_nps` e `last_response_at` serão calculados no mesmo loop que já conta `total_responses`, usando queries adicionais ao Supabase
- Filtros e busca são client-side (quantidade de campanhas é pequena)
- Delete usa `useDeleteCampaign` já existente com AlertDialog de confirmação

