

## Ajustar layout do dialog "Abrir Mesa"

Na captura, o dialog está com dois problemas visuais:

1. **Input cortado / com aparência de underline azul** — o container de scroll usa `pr-1` que corta a borda direita do input pelo `overflow-y-auto`, fazendo a borda parecer um traço.
2. **Footer empilhado** — `Cancelar` e `Abrir mesa` estão um sobre o outro porque o `DialogFooter` do shadcn é `flex-col` no mobile.

### Mudanças em `src/pages/garcom/GarcomMesaDetalhe.tsx`

**Container dos inputs**
- Trocar `space-y-2 max-h-[50vh] overflow-y-auto pr-1` por `space-y-3 max-h-[50vh] overflow-y-auto px-1 -mx-1` para dar respiro lateral sem cortar a borda do input.

**Input + botão remover**
- Adicionar `className="flex-1 min-w-0"` no `Input` para garantir que ele se ajuste ao container e não estoure.
- Mudar o botão `×` de `h-9 w-9` para `h-10 w-10 shrink-0` (combinando com a altura do Input e impedindo que ele encolha).
- Encurtar placeholder para `Ex: João, Casal...` (cabe melhor em 390px).

**Footer**
- Adicionar `className="flex-row gap-2 sm:gap-2"` no `DialogFooter` para forçar layout horizontal mesmo no mobile.
- Adicionar `className="flex-1"` em ambos os botões para dividirem a largura igualmente.

### Validação

- Em 390×844: o input aparece completo com borda íntegra, sem o traço azul cortado.
- Cancelar e Abrir mesa ficam lado a lado no rodapé, ocupando metade da largura cada.
- Adicionar 2ª comanda → input + botão `×` ficam alinhados sem quebrar.

