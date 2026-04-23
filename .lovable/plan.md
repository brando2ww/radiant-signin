

## Corrigir prefixo duplicado "Mmesa" nos cards de mesa do garçom

O `MesaCard` está renderizando `M{tableNumber}`, mas o `table_number` no banco já vem como `"Mesa 5"`, `"mesa 03"`, etc. — gerando "MMesa 5" / "Mmesa 03".

### Mudança

**`src/components/garcom/MesaCard.tsx`** — exibir o `tableNumber` exatamente como vem do banco, sem prefixo `M`:

```tsx
<span className={cn("text-lg font-bold text-center px-1 leading-tight", statusConfig.textColor)}>
  {tableNumber}
</span>
```

Adiciono `text-center px-1 leading-tight` para nomes mais longos (ex: "Mesa 03") caberem dentro do desenho da mesa sem estourar.

### Resultado

- "Mesa 5" → **Mesa 5**
- "5" → **5**
- "Mesa 03" → **Mesa 03**

### Validação

- Em `/garcom`, todos os cards mostram o nome da mesa como cadastrado, sem `M` extra na frente.

