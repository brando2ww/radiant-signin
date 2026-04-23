

## Bug: dialog de pagamento fecha ao remover item

### Causa

O `AlertDialog` de confirmação ("Remover item?") é renderizado como **irmão** do `Dialog` principal de pagamento (ambos sob um fragmento `<>`). Quando o usuário interage com o AlertDialog, o Radix do `Dialog` principal interpreta isso como uma "interação fora" e dispara `onOpenChange(false)` — fechando a tela de pagamento junto com a confirmação.

O mesmo aconteceria com o sub-dialog "Adicionar item à comanda".

### Correção em `src/components/pdv/cashier/PaymentDialog.tsx`

Adicionar handlers de prevenção no `DialogContent` principal para impedir o fechamento por interações externas (clique no overlay, foco em modal sobreposto). O dialog continua fechando normalmente pelo botão "X" do header e pelo fluxo de sucesso do pagamento.

```tsx
<DialogContent
  className="sm:max-w-3xl max-h-[90vh] overflow-hidden"
  onPointerDownOutside={(e) => e.preventDefault()}
  onInteractOutside={(e) => e.preventDefault()}
>
```

### Validação

- Abrir cobrança → clicar lixeira em um item → AlertDialog abre → confirmar "Remover" → item some, totais recalculam, **dialog de pagamento permanece aberto**.
- Abrir cobrança → "Adicionar item" → buscar e confirmar → item aparece no resumo, **dialog de pagamento permanece aberto**.
- Botão "X" do header e botão "Cancelar" continuam fechando normalmente.
- Clique no overlay externo agora **não fecha** o dialog (intencional — evita perda acidental de progresso durante cobrança).

