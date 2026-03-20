

## Integrar PaymentDialog no Salão

### Situação Atual
O Salão fecha comandas e pedidos diretamente via `closeComanda` / `closeOrder` sem passar pelo fluxo de pagamento. O `PaymentDialog` já existe no módulo Caixa com tudo que você precisa: débito, crédito, dinheiro, PIX, desconto, divisão de conta.

### O Que Vai Mudar

#### 1. `src/pages/pdv/Salon.tsx`
- Importar `PaymentDialog` do cashier
- Adicionar estados: `paymentDialogOpen`, `paymentComanda`, `paymentTable`, `paymentTableComandas`, `paymentTableItems`
- Modificar `onClose` da `ComandaDetailsDialog` (linha 756): em vez de chamar `closeComanda` direto, abrir o `PaymentDialog` com a comanda selecionada e seus itens
- Modificar `onCloseTable` da `TableDetailsDialog` (linha 319-331): em vez de fechar direto, abrir o `PaymentDialog` com a mesa, suas comandas e itens
- Adicionar callback `handlePaymentSuccess` que fecha os dialogs e invalida as queries
- Renderizar o `PaymentDialog` na área de dialogs

#### 2. Fluxo Resultante

```text
Comanda → "Fechar Comanda" → PaymentDialog abre
  → Escolhe método (débito/crédito/dinheiro/PIX)
  → Aplica desconto (com senha) ou divisão
  → Confirma → Comanda fechada + pagamento registrado

Mesa → "Fechar Mesa" → PaymentDialog abre (modo mesa)
  → Mesmo fluxo acima, fecha todas as comandas da mesa
```

#### 3. Desconto com senha
O `PaymentDialog` já tem campo de desconto (% ou valor). Vou adicionar um campo de senha obrigatória quando desconto > 0: um `Input type="password"` que valida contra uma senha configurável (por enquanto hardcoded ou via settings).

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/pdv/Salon.tsx` | Importar PaymentDialog, adicionar estados, redirecionar fechamento para o dialog de pagamento |
| `src/components/pdv/cashier/PaymentDialog.tsx` | Adicionar campo de senha obrigatória quando desconto > 0 |

