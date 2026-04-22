

## Acumular todas as edições e salvar somente no final

Hoje, vários botões dentro do gerenciador de Opções disparam o salvamento imediatamente no banco — e o painel de edição fecha. O usuário quer trabalhar em modo "rascunho", fazendo todas as alterações, e só efetivar tudo ao clicar em **"Salvar alterações"** na barra inferior.

### Comportamento alvo

Todas as ações abaixo passam a alterar apenas o **draft local** (sem ir ao servidor):

1. **Adicionar opção** ("Adicionar") — cria a opção apenas no rascunho.
2. **Adicionar item** ("+") — cria o item de opção apenas no rascunho.
3. **Excluir opção** (lixeira no cabeçalho da opção) — marca a opção para remoção.
4. **Excluir item** (lixeira ao lado do item) — marca o item para remoção.
5. **Vincular/desvincular insumo, alterar quantidade, nome, preço, tipo, mín/máx, obrigatório, disponível** — já são draft, permanecem assim.

A barra inferior **"Salvar alterações"** passa a ser o único ponto que persiste tudo:
- Cria as novas opções/itens (com IDs temporários) chamando `createOption` / `createItem`
- Aplica updates de campos alterados em opções/itens existentes
- Deleta opções/itens marcados para remoção
- Sincroniza receitas (insumos vinculados) por item — incluindo os recém-criados
- Mostra um único toast no final, ex.: "Alterações salvas (3 criadas, 2 atualizadas, 1 removida)"

O botão **"Descartar"** descarta todas as mudanças locais voltando ao baseline, sem tocar no banco.

### Detalhes técnicos

Arquivo único: `src/components/pdv/PDVProductOptionsManager.tsx`

1. **IDs temporários**: novos itens/opções recebem id `tmp-opt-<uuid>` / `tmp-item-<uuid>`. Um helper `isTempId(id)` identifica registros não persistidos.
2. **Estado de remoção**: estender `DraftOption` e `DraftOption["items"]` localmente com flag `_deleted?: boolean` (não enviada ao backend, apenas controle de draft). A renderização filtra `_deleted` para esconder visualmente.
3. **Handlers reescritos**:
   - `handleAddOption` → `setDraft(prev => [...prev, { id: tmpId, name, type:'single', is_required:false, min_selections:0, max_selections:1, items: [], _isNew:true }])`
   - `handleAddItem(optionId)` → push de item com `id: tmpItemId, _isNew:true` no array `items` da opção draft
   - `handleDeleteOption(optionId)` → se temp, remove do array; senão marca `_deleted=true`
   - `handleDeleteItem(optionId, itemId)` → idem
4. **`isDirty`** continua via comparação `JSON.stringify(draft) !== baseline`, que já cobre criações/remoções/edições.
5. **`handleSave` (refeito em ordem segura)**:
   - **Fase 1 — Deleções**: `deleteItem` para items marcados (apenas não-temp), depois `deleteOption` para opções marcadas (não-temp).
   - **Fase 2 — Criação de opções novas**: para cada opção `_isNew`, chamar `createOption.mutateAsync` e capturar o `id` real retornado; mapear `tmpOptId → realOptId`.
   - **Fase 3 — Updates de opções existentes**: campos alterados vs baseline.
   - **Fase 4 — Itens**: para cada opção (usando id real), criar items `_isNew` via `createItem.mutateAsync` (capturar id real); atualizar items existentes alterados.
   - **Fase 5 — Receitas**: aplicar `removeByOptionItem` + `upsertRecipe` por item (incluindo os recém-criados, usando o id real retornado).
   - Toast final consolidado; em caso de erro parcial, manter draft (não atualizar baseline) e mostrar `toast.error`.
6. **Sync com servidor (`useEffect` linhas 58–102)**: ajustar para **não** sobrescrever opções/itens com flag `_isNew` ou `_deleted`, evitando que o merge apague rascunhos enquanto o usuário edita.
7. **Sinalização visual** (opcional, leve): badge "Novo" ao lado de itens/opções `_isNew` e opacidade reduzida em itens marcados como `_deleted` antes de salvar — ou simplesmente esconder removidos. Vou esconder removidos e adicionar um pequeno texto "Não salvo" na barra inferior listando contagem (já existente é suficiente; manter simples).

### Fora de escopo
- Reordenação por drag-and-drop (não mexe no fluxo atual).
- Validações adicionais além das já existentes (nome obrigatório, etc.).

