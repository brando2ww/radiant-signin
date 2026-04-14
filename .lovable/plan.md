

# Reformular Pagina Score da Equipe

Reescrever `TeamScorePanel` como uma pagina completa e motivadora de acompanhamento de desempenho, com podio visual, ranking detalhado, grafico de evolucao, secao de badges e explicacao da formula de calculo.

## Sem mudancas no banco de dados

As tabelas `operator_scores`, `checklist_operators`, `checklist_executions` e `checklist_execution_items` ja contem todos os dados necessarios. O hook `useOperatorRanking` ja calcula score, badges e metricas — sera expandido para suportar periodos customizados e comparacao com periodo anterior.

## Arquivos novos

### 1. `src/components/pdv/checklists/score/ScoreOverview.tsx`

Topo da pagina:
- Seletor de periodo: Semana Atual, Semana Passada, Mes Atual, Mes Passado, Personalizado (date range picker)
- 4 cards de destaque: Score medio da equipe (com variacao vs periodo anterior), Taxa de conclusao geral (%), Colaborador com maior score (avatar + nome + pontuacao), Colaborador que mais melhorou (nome + variacao positiva)

### 2. `src/components/pdv/checklists/score/ScorePodium.tsx`

Podio visual dos 3 melhores:
- Layout de podio classico (2o | 1o | 3o) com 1o lugar elevado
- Cada posicao: avatar colorido por setor, nome, cargo, score, variacao vs periodo anterior
- Icones de trofeu/medalha diferenciados
- Estado vazio: podio com silhuetas em cinza e mensagem "Aguardando primeiros dados"

### 3. `src/components/pdv/checklists/score/ScoreRanking.tsx`

Ranking completo da equipe:
- Tabela/lista ordenada por score decrescente
- Cada linha: posicao, avatar, nome, setor, score, variacao (+/- pts com seta colorida), taxa de conclusao no prazo, total checklists concluidos, badges do periodo
- Filtro por setor
- Clicar no colaborador abre `OperatorProfileDrawer` existente

### 4. `src/components/pdv/checklists/score/ScoreEvolutionChart.tsx`

Grafico de evolucao:
- Linha do score medio da equipe nas ultimas 4-8 semanas (usa `operator_scores`)
- Selecao multipla de colaboradores para sobrepor linhas individuais
- Linha de meta configuravel (input numerico, padrao 80)
- Usa Recharts (ja instalado)

### 5. `src/components/pdv/checklists/score/BadgesSection.tsx`

Secao de badges e conquistas:
- Lista dos 6 badges do sistema: Semana Perfeita, Destaque do Mes, Sequencia de 7 dias, Zero Atrasos, Veterano, Consistente
- Cada badge: icone, nome, descricao, quantos conquistaram, ultimos conquistadores
- Dados calculados a partir de `operator_scores` e `checklist_executions`

### 6. `src/components/pdv/checklists/score/ScoreFormulaInfo.tsx`

Bloco informativo:
- Explicacao visual da formula (Pontualidade 40% + Completude 30% + Qualidade 30%)
- Barras proporcionais mostrando os pesos
- Link para pagina de Configuracoes

## Arquivos editados

### 7. `src/hooks/use-operator-scores.ts`

Expandir o hook:
- Adicionar tipo de periodo `"last_week" | "last_month" | "custom"` com datas customizaveis
- Expandir `OperatorRank` com `sector`, `role`, `avatarColor`, `completionRate`
- Nova funcao `useOperatorRankingComparison` que busca ranking de dois periodos e calcula variacao por operador
- Expandir `useScoreHistory` para suportar multiplos operadores simultaneamente (para grafico comparativo)
- Nova funcao `useBadgesSummary` que analisa `operator_scores` para determinar conquistas dos badges avancados

### 8. `src/components/pdv/checklists/TeamScorePanel.tsx`

Reescrita completa:
- Importa e orquestra os 5 componentes novos em layout vertical
- Gerencia estado do periodo selecionado, operadores selecionados para grafico, drawer de perfil
- Passa `onNavigate` para links de atalho (configuracoes, tarefas do dia, equipe)
- Estado vazio inteligente com podio em cinza e atalhos

### 9. `src/pages/pdv/Tasks.tsx`

- Passar `onNavigate={setActiveSection}` para `TeamScorePanel`

## Resumo tecnico

- **0 migrations** (usa tabelas existentes)
- **6 arquivos novos** (5 componentes de secao + 1 formula info)
- **3 arquivos editados** (TeamScorePanel, use-operator-scores, Tasks.tsx)
- **0 dependencias novas** (Recharts ja instalado)

