

## Fix: Senha de desconto não aparece em % + totais somem + máscaras

### Problema 1: Senha não aparece para desconto em %
O campo de senha aparece quando `hasDiscount = discountAmount > 0`. Porém `discountAmount` para percentual é calculado como `subtotal * %`. Se o subtotal for 0, o resultado é 0 mesmo com valor digitado, então `hasDiscount` fica `false` e os campos de senha/motivo não aparecem.

**Fix**: Mudar `hasDiscount` para verificar se o **valor digitado** é > 0, não o resultado calculado:
```tsx
const hasDiscount = parseFloat(discountValue) > 0;
```

### Problema 2: Totais somem quando campos de desconto aparecem
Os campos de motivo + senha empurram o card de totais para fora do `max-h-[60vh]` do scroll. A solução é mover os campos de motivo e senha para uma seção separada **abaixo do card de desconto** ou reorganizar o layout para que os totais fiquem sempre visíveis (fixos no footer da coluna esquerda).

**Fix**: Mover motivo + senha para dentro de um bloco compacto colapsado dentro do mesmo card, e garantir que o card de totais fique fora do scroll (fixo embaixo).

### Problema 3: Máscaras nos inputs de desconto
- **%**: Usar input com sufixo "%" e limitar a 0-100
- **R$**: Usar o componente `CurrencyInput` já existente

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/cashier/PaymentDialog.tsx` | (1) Mudar `hasDiscount` para `parseFloat(discountValue) > 0`. (2) Extrair card de totais do scroll e fixar embaixo. (3) Substituir input de desconto por CurrencyInput quando tipo "value" e input com max 100 + sufixo % quando tipo "percent". (4) Campos de motivo e senha ficam compactos dentro do mesmo card |

### Detalhes

**hasDiscount** (linha 147):
```tsx
const hasDiscount = parseFloat(discountValue) > 0;
```

**Input de desconto** (linhas 384-396):
- Tipo `percent`: Input numérico com max=100, placeholder "0", sufixo visual "%"
- Tipo `value`: `CurrencyInput` com máscara R$

**Layout**: O `grid md:grid-cols-2` terá o scroll apenas na parte de itens + desconto/pagamento, com os totais fixos no bottom da coluna esquerda fora do overflow.

