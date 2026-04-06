
## Corrigir clique nos insumos do combobox

### Diagnóstico confirmado
- `ProductOptionDialog` já está com `Dialog modal={false}` e o seletor já está com `Popover modal={false}`.
- O problema continua porque os wrappers base ainda criam camadas portaled com a mesma faixa de z-index:
  - `src/components/ui/dialog.tsx` sempre renderiza `DialogOverlay`
  - `src/components/ui/popover.tsx` sempre renderiza `PopoverPrimitive.Portal` no `body`
- Na sessão, o dropdown abre e fecha, mas o clique não está chegando no `CommandItem`; ele “passa” para elementos do dialog por baixo. Por isso a lista aparece, mas selecionar “Camarão a Milanesa” não atualiza nada.

### Implementação
1. **`src/components/ui/popover.tsx`**
   - Adicionar suporte a `container` no portal do popover.
   - Encaminhar esse valor para `PopoverPrimitive.Portal container={...}`.
   - Manter o comportamento atual como fallback quando nenhum container for passado.

2. **`src/components/delivery/ProductOptionDialog.tsx`**
   - Criar um `ref` para o `DialogContent`.
   - Renderizar o dropdown do insumo dentro do próprio dialog, em vez de deixar o portal ir para `document.body`:
     ```tsx
     <PopoverContent container={dialogContentRef.current} ... />
     ```
   - Manter `Dialog modal={false}` e `Popover modal={false}`.
   - Garantir `type="button"` no trigger e no botão de limpar vínculo.
   - Continuar resetando `openPopoverIndex` ao fechar o dialog.
   - Adicionar `DialogDescription` (ou `aria-describedby={undefined}`) para remover o warning atual do console.

3. **Não mexer nos hooks**
   - `handleSelectIngredient` e `use-product-options.ts` não parecem ser a causa.
   - O problema é de camada/portal/interação, não de salvamento.

### Resultado esperado
- Clicar em um item da lista seleciona no primeiro clique.
- O popover fecha normalmente.
- O botão passa a mostrar o insumo escolhido.
- Quantidade/unidade continuam editáveis.
- O vínculo continua salvando e reabrindo corretamente.

### Validação
1. Abrir produto > Opções e Complementos > criar/editar opção.
2. Abrir “Buscar insumo...”.
3. Clicar em itens diferentes da lista.
4. Confirmar:
   - seleção no primeiro clique,
   - botão atualizado com o nome do insumo,
   - quantidade/unidade visíveis,
   - salvar e reabrir mantendo o vínculo,
   - teste completo dentro do dialog de produto.
