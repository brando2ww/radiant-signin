

## Plano: Traduzir Calendario para Portugues

### Problema Atual
O calendario no dialog "Nova Solicitacao de Cotacao" esta exibindo em ingles:
- Mes: "January 2026" (deveria ser "Janeiro 2026")
- Dias da semana: "Su Mo Tu We Th Fr Sa" (deveria ser "Do Se Te Qu Qu Se Sa")

### Causa
O componente `QuotationRequestDialog` ja importa `ptBR` do date-fns (linha 4), mas nao passa a prop `locale` para o componente `Calendar`.

### Solucao

**Arquivo:** `src/components/pdv/purchases/QuotationRequestDialog.tsx`

Adicionar a prop `locale={ptBR}` no componente Calendar (linha 185-191):

**De:**
```tsx
<Calendar
  mode="single"
  selected={deadline}
  onSelect={(date) => date && setDeadline(date)}
  disabled={(date) => date < new Date()}
  initialFocus
/>
```

**Para:**
```tsx
<Calendar
  mode="single"
  selected={deadline}
  onSelect={(date) => date && setDeadline(date)}
  disabled={(date) => date < new Date()}
  initialFocus
  locale={ptBR}
  className="pointer-events-auto"
/>
```

### Resultado

| Elemento | Antes | Depois |
|----------|-------|--------|
| Nome do mes | January 2026 | Janeiro 2026 |
| Dias da semana | Su Mo Tu We Th Fr Sa | Do Se Te Qu Qu Se Sa |

A prop `className="pointer-events-auto"` tambem e adicionada seguindo as boas praticas do Shadcn para garantir interatividade dentro de popovers.

