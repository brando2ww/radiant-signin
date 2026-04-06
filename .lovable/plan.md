

## Melhorar Interface de Criação de Perguntas

### Problema
Atualmente a criação de perguntas é inline — um input solto no topo da lista com um select ao lado. Não há separação visual clara, labels explicativos, nem preview do que está sendo criado. É confuso especialmente para tipos de escolha múltipla.

### Solução
Substituir o formulário inline por um **Dialog dedicado** ("Nova Pergunta") aberto por um botão "+ Nova Pergunta". O dialog terá:

**1. Estrutura do Dialog (`QuestionFormDialog.tsx` — novo componente)**
- Título: "Nova Pergunta"
- **Step 1 — Tipo**: 3 cards clicáveis lado a lado (Estrelas, Escolha Única, Múltipla Escolha) com ícone, título e descrição curta. Card selecionado com borda colorida.
- **Step 2 — Texto**: Input com label "Texto da pergunta" e placeholder contextual por tipo
- **Step 3 — Opções** (só para tipos de escolha): Seção com label "Opções de resposta", lista de chips removíveis, input para adicionar, contador "mínimo 2 opções"
- **Preview**: Seção lateral/inferior mostrando como a pergunta aparecerá para o cliente (mini preview com estrelas ou botões de opção)
- Footer: Cancelar + "Adicionar Pergunta"

**2. Atualizar `CampaignQuestionManager.tsx`**
- Remover o formulário inline (input + select no topo)
- Manter botões "+ Nova Pergunta" (abre dialog) e "Importar Template"
- Lista de perguntas existentes fica igual

### Arquivos
1. **`src/components/pdv/evaluations/QuestionFormDialog.tsx`** — novo dialog de criação
2. **`src/components/pdv/evaluations/CampaignQuestionManager.tsx`** — simplificar, usar o novo dialog

