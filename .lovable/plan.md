Plano para corrigir o desconto no pagamento:

1. Ajustar o resumo de confirmação do desconto em `PaymentDialog.tsx`
   - Trocar o uso de `previewAmount` por `computedDiscountAmount` no bloco “Confirmar desconto”.
   - Isso corrige os campos:
     - “Será descontado”
     - “Novo total”
   - Hoje eles ainda usam `previewAmount`, que vira `0` quando a etapa muda de `typing` para `confirming`.

2. Ajustar a validação e exibição para não depender da etapa visual
   - Manter `previewAmount` apenas para a etapa de digitação.
   - Usar `computedDiscountAmount` em todas as ações/validações da etapa de confirmação.
   - Garantir que o botão “Confirmar” continue gravando o valor correto.

3. Revisar os totais exibidos após aplicar
   - Confirmar que, depois de aplicado, `discountAmount = appliedDiscount.amount` reduz:
     - subtotal
     - taxa de serviço calculada sobre o valor com desconto
     - total final
   - Não alterar o fluxo de senha/autorização.

Resultado esperado:
- Ao digitar desconto fixo de R$ 10,00, a confirmação mostrará `-R$ 10,00`, não `-R$ 0,00`.
- Ao confirmar, o total cairá corretamente.
- O toast “Desconto aplicado” só aparecerá depois de aplicar um valor real.