

# Reformular Editor de Checklists — Pagina Dedicada

Transformar o modal simples de criacao/edicao em uma pagina completa com editor profissional de itens, preview mobile em tempo real e templates melhorados.

## Mudancas no banco de dados

### Migration 1: Novas colunas e tipo

```sql
-- Cor do checklist
ALTER TABLE checklists ADD COLUMN color text DEFAULT '#6366f1';

-- Turno padrao
ALTER TABLE checklists ADD COLUMN default_shift text DEFAULT 'todos';

-- Novo tipo "multipla escolha"
ALTER TYPE checklist_item_type ADD VALUE 'multiple_choice';

-- Opcoes para multipla escolha (jsonb array de strings)
ALTER TABLE checklist_items ADD COLUMN options jsonb DEFAULT NULL;
```

A coluna `is_active` ja existe e sera usada como status (ativo vs rascunho).

## Arquivos novos

### 1. `src/pages/pdv/ChecklistEditor.tsx`

Pagina dedicada de edicao. Recebe `checklistId` via URL param (ou "novo").

- Layout duas colunas: esquerda (config, ~40%), direita (itens + preview, ~60%)
- Header fixo com botao "Voltar" e "Salvar"
- Se `id === "novo"`, cria checklist ao salvar pela primeira vez
- Se editando, carrega dados existentes

### 2. `src/components/pdv/checklists/editor/ChecklistConfigPanel.tsx`

Coluna esquerda:
- Nome (input obrigatorio)
- Setor: grid de botoes com icones (UtensilsCrossed, Armchair, Calculator, Wine, Package, Briefcase), nao dropdown
- Descricao (textarea)
- Cor: seletor visual com circulos coloridos (reutilizar `SECTOR_COLORS`)
- Turno padrao: botoes Manha/Tarde/Noite/Todos
- Status: switch Ativo/Rascunho

### 3. `src/components/pdv/checklists/editor/ChecklistItemsList.tsx`

Coluna direita — editor de itens:
- Contador no topo: "X itens — Y obrigatorios — Z criticos"
- Lista ordenada com drag-and-drop (usar estado local + `reorderItems`)
- Cada item mostra: titulo, tipo (icone), badges (critico/obrigatorio), controles hover (editar, duplicar, excluir, arrastar)
- Barra de adicao no final: botoes rapidos por tipo (Checkbox, Numero, Temperatura, Foto, Texto, Estrelas, Multipla escolha) — um clique adiciona e abre nome para digitar
- Para tipo `multiple_choice`: campo para adicionar/remover opcoes (chips)
- Para tipo `temperature`: campos min/max

### 4. `src/components/pdv/checklists/editor/ChecklistMobilePreview.tsx`

Preview mobile em tempo real:
- Container com borda arredondada simulando tela de celular (max-w-xs, aspect ratio mobile)
- Renderiza os itens como o colaborador veria: checkbox, input numerico, captura foto, stars, campo texto, radio buttons (multipla escolha)
- Atualiza automaticamente conforme itens sao editados

## Arquivos editados

### 5. `src/App.tsx`

Adicionar rota dentro de `/pdv/*`:
- `/pdv/tarefas/checklists/novo` → `ChecklistEditor`
- `/pdv/tarefas/checklists/:id` → `ChecklistEditor`

### 6. `src/pages/pdv/Tasks.tsx`

No `renderContent` para `case "checklists"`, passar callback para `ChecklistsManager` navegar para a nova pagina via `useNavigate`.

### 7. `src/components/pdv/checklists/ChecklistsManager.tsx`

- Remover `ChecklistDialog` e `editingItemsId` inline
- "Novo Checklist" navega para `/pdv/tarefas/checklists/novo`
- Clicar em checklist navega para `/pdv/tarefas/checklists/:id`
- Manter duplicar e excluir na lista

### 8. `src/components/pdv/checklists/TemplateLibraryDialog.tsx`

Melhorar:
- Mostrar icones dos tipos de item presentes, preview dos primeiros 3 itens
- Filtro por setor
- Adicionar 6 novos templates (Fechamento Salao, Fechamento Caixa, Fechamento Bar, Controle de Validade, Higienizacao, Onboarding Colaborador)
- "Usar Template" carrega itens no editor (via callback) em vez de criar checklist separado

### 9. `src/hooks/use-checklists.ts`

- Adicionar `color` e `default_shift` nos tipos e mutations
- Adicionar `"multiple_choice"` ao `ITEM_TYPE_LABELS`
- Adicionar `options` no `upsertItem`

## Resumo

- **1 migration** (colunas + enum)
- **4 arquivos novos** (pagina + 3 componentes do editor)
- **5 arquivos editados** (App.tsx, Tasks.tsx, ChecklistsManager, TemplateLibraryDialog, use-checklists)
- **0 dependencias novas** (drag-and-drop com estado local via botoes mover cima/baixo; sem lib extra)

