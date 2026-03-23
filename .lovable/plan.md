

## Fix: Layout do desconto cortando campos de senha e motivo

### Problema
A coluna esquerda do PaymentDialog usa `max-h-[60vh]` com scroll interno. Quando o desconto é ativado, os campos de motivo + senha + botão de autorizar ficam dentro do scroll e são cortados/escondidos, especialmente com itens no pedido.

### Solução
Reorganizar os campos de desconto para serem mais compactos e garantir que não sejam cortados:

1. **Compactar o card de desconto** — colocar motivo e senha lado a lado em grid de 2 colunas quando há espaço
2. **Reduzir a altura fixa do ScrollArea de itens** de 140px para 120px para dar mais espaço
3. **Aumentar o max-h da coluna** de `60vh` para `65vh`
4. **Tornar senha e motivo mais compactos** — inputs menores, labels inline

### Arquivo

| Arquivo | Acao |
|---------|------|
| `src/components/pdv/cashier/PaymentDialog.tsx` | Reorganizar layout: (1) ScrollArea de itens reduzida para 120px. (2) Campos motivo e senha em grid `grid-cols-2` compacto. (3) `max-h-[60vh]` → `max-h-[65vh]`. (4) Remover espaçamento excessivo nos campos de desconto |

### Detalhes

```tsx
{/* Discount reason + password side by side */}
{hasDiscount && (
  <div className="grid grid-cols-2 gap-2 mt-2">
    <div>
      <Label className="text-xs">Motivo *</Label>
      <Input size="sm" placeholder="Ex: Cliente frequente" ... />
    </div>
    <div>
      <Label className="text-xs">Senha de autorização</Label>
      <div className="flex gap-1">
        <Input type="password" size="sm" ... />
        <Button size="sm">...</Button>
      </div>
    </div>
  </div>
)}
```

Isso mantém tudo visível sem cortar, usando melhor o espaço horizontal disponível.

