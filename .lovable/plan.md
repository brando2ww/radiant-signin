

## Adicionar Edição de Perguntas Existentes

### Problema
Atualmente só é possível criar perguntas novas. Não há como editar o texto, mudar o tipo (ex: de estrelas para múltipla escolha) ou alterar as opções de uma pergunta já criada.

### Solução

**1. Adaptar `QuestionFormDialog.tsx` para modo edição**
- Aceitar prop opcional `initialData` com `id`, `question_text`, `question_type`, `options`
- Quando `initialData` presente: pré-preencher todos os campos, mudar título para "Editar Pergunta" e botão para "Salvar Alterações"
- Ao fechar/submeter, resetar normalmente

**2. Adicionar botão de editar em `CampaignQuestionManager.tsx`**
- Novo state `editingQuestion` para armazenar a pergunta selecionada para edição
- Botão de edição (ícone Pencil) ao lado do botão de excluir em cada card
- Ao clicar, abre o dialog com os dados da pergunta preenchidos
- No submit do modo edição, chama `updateQuestion.mutate` com `question_text`, `question_type` e `options`

**3. Atualizar `useUpdateCampaignQuestion` no hook**
- Expandir os tipos aceitos no `mutationFn` para incluir `question_type` e `options` (atualmente só aceita `question_text`, `is_active`, `order_position`)

### Arquivos alterados
1. `src/components/pdv/evaluations/QuestionFormDialog.tsx` — prop `initialData`, título/botão dinâmico
2. `src/components/pdv/evaluations/CampaignQuestionManager.tsx` — state de edição, botão Pencil, handler de update
3. `src/hooks/use-evaluation-campaigns.ts` — expandir tipos do `useUpdateCampaignQuestion`

