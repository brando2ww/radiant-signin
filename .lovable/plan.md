

## Corrigir tela travada ao fechar o dialog de produto

### Diagnóstico
O `ProductOptionDialog` usa `Dialog modal={false}`, mas o componente `DialogContent` sempre renderiza o `DialogOverlay` (fundo escuro `fixed inset-0 z-50 bg-black/80`). Quando o dialog não é modal, esse overlay cria uma camada invisível que bloqueia cliques. Ao fechar o dialog pai (ProductDialog do delivery), o overlay do filho não-modal pode não ser removido corretamente, travando toda a interface.

### Implementação

1. **`src/components/ui/dialog.tsx`**
   - Adicionar prop opcional `hideOverlay?: boolean` ao `DialogContent`
   - Quando `hideOverlay` for `true`, não renderizar o `DialogOverlay` dentro do portal
   - Manter comportamento padrão (com overlay) quando a prop não for passada

2. **`src/components/delivery/ProductOptionDialog.tsx`**
   - Passar `hideOverlay` no `DialogContent` já que o dialog usa `modal={false}`
   - Isso remove a camada bloqueante que causa o travamento

### Resultado esperado
- Fechar o dialog de produto (PDV ou delivery) não trava mais a tela
- A navegação e cliques voltam a funcionar normalmente após fechar qualquer modal
- O dialog de opções continua funcionando (inclusive a seleção de insumos)

