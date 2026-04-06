
## Abrir caixa de comentário para qualquer nota abaixo da máxima

### Mudança
No arquivo `src/pages/PublicEvaluation.tsx`, linha 329, alterar a condição de exibição da caixa de comentário:

- **Antes**: `score > 0 && score <= 2` — só mostra para notas 1 e 2
- **Depois**: `score > 0 && score < 5` — mostra para notas 1, 2, 3 e 4

A nota máxima (5 estrelas) não exibirá a caixa. Todas as outras notas abrirão o campo opcional de comentário com animação fade-in.

### Arquivo alterado
- `src/pages/PublicEvaluation.tsx` — uma única linha alterada (condição do `if`)
