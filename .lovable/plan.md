

## Botao "Visualizar" no NPSDetailDialog

### O que muda
Adicionar uma coluna de acao na tabela do `NPSDetailDialog` com um botao "Visualizar" (icone de olho) que abre o `ClientDetailDialog` existente, mostrando o historico completo de avaliacoes do cliente.

### Implementacao

**1. `NPSDetailDialog.tsx`**
- Importar `ClientDetailDialog` e o icone `Eye` do lucide-react
- Expandir a interface `Evaluation` para incluir `evaluation_answers` (ja vem do tipo `EvaluationWithAnswers`)
- Adicionar estado `selectedClient` para controlar o dialog de detalhe
- Ao clicar no botao "Visualizar", agrupar todas as avaliacoes do mesmo cliente (por whatsapp) e montar o objeto esperado pelo `ClientDetailDialog`
- Adicionar coluna "Acoes" na tabela com o botao de olho

**2. `EvaluationsDashboard.tsx`**
- Ja passa `evaluations` (que sao `EvaluationWithAnswers[]`) para o dialog, entao os dados de respostas ja estao disponiveis

### Arquivos alterados
1. `src/components/evaluations/dashboard/NPSDetailDialog.tsx` — adicionar botao visualizar + integrar ClientDetailDialog

