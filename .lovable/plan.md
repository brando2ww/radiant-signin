

# Reformular Galeria de Evidencias

Reescrever `EvidenceGallery` como uma central de auditoria visual com indicadores, filtros expandidos, lightbox profissional, visualizacao em lista, secao de atencao, e exportacao expandida.

## Sem mudancas no banco de dados

As tabelas `checklist_execution_items`, `checklist_evidence_reviews`, `checklist_executions`, `checklist_items`, `checklist_operators` e `checklists` ja contem todos os dados necessarios (photo_url, item_type, is_critical, is_compliant, sector, operator, review status/comment). Nenhuma migration necessaria.

## Arquivos novos

### 1. `src/components/pdv/checklists/evidence/EvidenceOverview.tsx`

4 cards de indicadores no topo:
- Total de evidencias no periodo
- Pendentes de revisao (sem review ou status pendente)
- Aprovadas
- Reprovadas
- Dados calculados a partir da lista de evidencias filtrada

### 2. `src/components/pdv/checklists/evidence/EvidenceFilters.tsx`

Barra de filtros expandida:
- Data (mantido), Setor (mantido)
- Novo: Colaborador (select com operadores do usuario)
- Novo: Checklist (select com checklists do usuario)
- Novo: Status (Todas, Pendente, Aprovada, Reprovada)
- Novo: Tipo de item (checkbox, photo, temperature, etc. — do enum `checklist_item_type`)
- Toggle grade/lista
- Botao exportar com dropdown (ZIP, CSV)

### 3. `src/components/pdv/checklists/evidence/EvidenceGridCard.tsx`

Card individual na grade:
- Miniatura quadrada com badge de status colorido (verde/vermelho/amarelo)
- Rodape: colaborador, checklist, setor com cor, data/hora
- Hover: overlay com botoes rapidos (ver, aprovar, reprovar)
- Borda vermelha se item critico ou temperatura fora da faixa

### 4. `src/components/pdv/checklists/evidence/EvidenceLightbox.tsx`

Lightbox em tela cheia (Dialog fullscreen):
- Foto grande ocupando lado esquerdo
- Painel lateral direito: colaborador (avatar + nome), checklist, item, setor, turno, data/hora, status atual
- Botoes: Aprovar, Reprovar, campo de comentario
- Navegacao entre evidencias (setas + teclado)
- Historico de review (quem aprovou/reprovou e quando)

### 5. `src/components/pdv/checklists/evidence/EvidenceListView.tsx`

Visualizacao em lista:
- Tabela: miniatura, colaborador, checklist, item, setor, data/hora, status, comentario
- Acoes inline: aprovar, reprovar
- Checkbox para selecao multipla
- Barra de acoes em lote (aprovar/reprovar selecionados)

### 6. `src/components/pdv/checklists/evidence/EvidenceAttentionSection.tsx`

Bloco colapsavel no topo:
- Evidencias reprovadas ou de itens criticos
- Evidencias com temperatura fora da faixa (is_compliant === false)
- Destaque visual com borda vermelha/amarela

## Arquivos editados

### 7. `src/hooks/use-checklist-evidence.ts`

Expandir:
- Adicionar filtros: `checklistId`, `status`, `itemType` ao `EvidenceFilters`
- Expandir `EvidenceItem` com: `itemType`, `isCritical`, `isCompliant`, `checklistId`, `completedAt`, `reviewerId`, `reviewedAt`
- Incluir `item_type`, `is_critical` no join com `checklist_items`
- Incluir `completed_at` do execution item
- Novo hook `useEvidenceOperators`: busca operadores distintos que tem evidencias
- Novo hook `useEvidenceChecklists`: busca checklists distintos que tem evidencias
- Expandir `useReviewEvidence` para suportar lote (array de IDs)

### 8. `src/components/pdv/checklists/EvidenceGallery.tsx`

Reescrita completa:
- Importa e orquestra os 6 componentes novos
- Gerencia estados: filtros, modo visualizacao (grade/lista), lightbox aberto, indice atual, selecao multipla
- Estado vazio inteligente com mensagens contextuais e atalhos
- Exportacao CSV de metadados alem do ZIP existente

## Resumo tecnico

- **0 migrations**
- **6 arquivos novos** (6 componentes de secao)
- **2 arquivos editados** (EvidenceGallery, use-checklist-evidence)
- **0 dependencias novas** (JSZip/file-saver ja instalados)

