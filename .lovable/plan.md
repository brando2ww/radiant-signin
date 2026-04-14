

# Fase 5 -- Score, Evidencias, Validade e Log de Acessos

Todas as tabelas necessarias ja existem no banco (`operator_scores`, `checklist_evidence_reviews`, `product_expiry_tracking`, `checklist_access_logs`). Nenhuma migration necessaria.

---

## 5.1 Hook de Score da Equipe

**Arquivo novo**: `src/hooks/use-operator-scores.ts`

- `useOperatorRanking()`: para cada operador, calcula score (0-100) baseado em execucoes do periodo:
  - Prazo (40%): `concluido` no tempo / total
  - Completude (30%): itens preenchidos / total itens
  - Qualidade (30%): media das avaliacoes por estrelas
- Persiste em `operator_scores` com `period_start`/`period_end`
- Calcula badges automaticos em JSON:
  - "Semana Perfeita": 100% conclusao na semana
  - "Destaque do Mês": maior score no mes
- `useScoreHistory(operatorId, period)`: busca historico de scores por semana/mes para grafico

## 5.2 Componente de Score e Ranking

**Arquivo novo**: `src/components/pdv/checklists/TeamScorePanel.tsx`

- Ranking da equipe: lista ordenada por score com avatar, nome, posicao, score (progress bar), badges
- Filtro por periodo: semana atual / mes atual
- Grafico de historico (Recharts LineChart) por operador selecionado

## 5.3 Hook de Evidencias

**Arquivo novo**: `src/hooks/use-checklist-evidence.ts`

- `useEvidenceGallery(filters)`: busca `checklist_execution_items` com `photo_url IS NOT NULL`, join com execution/checklist/operator para metadados
- Filtros: data, setor, colaborador
- `reviewEvidence(executionItemId, status, comment)`: insere/atualiza `checklist_evidence_reviews`
- `useEvidenceReviews(executionItemId)`: busca reviews de um item

## 5.4 Componente Galeria de Evidencias

**Arquivo novo**: `src/components/pdv/checklists/EvidenceGallery.tsx`

- Grid de fotos com thumbnail, data, setor, operador
- Ao clicar: modal com foto ampliada + botoes Aprovar/Reprovar/Comentar
- Filtros por data (DatePicker), setor (Select), colaborador (Select)
- Botao "Exportar" que baixa as fotos filtradas (zip via JSZip)

## 5.5 Hook de Controle de Validade

**Arquivo novo**: `src/hooks/use-product-expiry.ts`

- CRUD completo em `product_expiry_tracking`
- `useExpiryAlerts()`: busca itens com `expiry_date` proxima (3 dias, 1 dia) ou vencida, atualiza status automaticamente
- `useExpiryHistory(period)`: historico de perdas/descartes

## 5.6 Componente de Validade

**Arquivo novo**: `src/components/pdv/checklists/ExpiryTrackingPanel.tsx`

- CRUD: nome do produto, lote, data de validade, notas
- Cards de alerta: vermelho (vencido), amarelo (1 dia), laranja (3 dias), verde (valido)
- Tabela de historico com filtros e status

## 5.7 Hook de Log de Acessos

**Arquivo novo**: `src/hooks/use-checklist-access-logs.ts`

- `logAccess(operatorId, action, details)`: insere em `checklist_access_logs`
- `useAccessLogs(filters)`: busca logs com join em `checklist_operators` para nome
- Integrar chamada de log no PIN login (PublicTasks) e nas acoes de execucao

## 5.8 Componente de Log de Acessos

**Arquivo novo**: `src/components/pdv/checklists/AccessLogsPanel.tsx`

- Tabela cronologica: data/hora, operador, acao, detalhes
- Filtros: data, operador

## 5.9 Novas abas na pagina Tasks.tsx

Adicionar 4 novas abas ao `TabsList`:
- **Score** -> `TeamScorePanel`
- **Evidencias** -> `EvidenceGallery`
- **Validade** -> `ExpiryTrackingPanel`
- **Logs** -> `AccessLogsPanel`

## 5.10 Integrar log de acesso no PublicTasks

Editar `src/pages/PublicTasks.tsx` para chamar `logAccess` apos login por PIN e ao concluir checklist.

---

## Resumo tecnico

- **0 migrations** (tabelas ja existem)
- **~8 arquivos novos**: 4 hooks + 4 componentes
- **~2 arquivos editados**: `Tasks.tsx` (novas abas), `PublicTasks.tsx` (log de acesso)
- Dependencia extra: `jszip` para exportacao de fotos (instalar via npm)

