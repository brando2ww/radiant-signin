

## Ocultar a barra de scroll das categorias na tela `/garcom/itens`

A faixa horizontal de categorias (Todos · A la carte · Bebidas · Drinks) está mostrando uma scrollbar visível embaixo. Vou ocultá-la mantendo o scroll horizontal funcional (touch e arrastar).

### Mudança

**`src/components/garcom/ProductCategoryNav.tsx`**

Adicionar a classe utilitária `scrollbar-hide` (ou inline style com `scrollbarWidth: 'none'` + `::-webkit-scrollbar { display: none }`) no container que faz `overflow-x-auto`.

Como o projeto usa Tailwind v3 sem o plugin `tailwind-scrollbar-hide`, vou aplicar a solução via CSS global em `src/index.css`:

```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

E aplicar `no-scrollbar` no wrapper de `overflow-x-auto` do `ProductCategoryNav`.

### Escopo

- Afeta somente a navegação horizontal de categorias do garçom (`/garcom/itens` e `/garcom/comanda/:id/adicionar`).
- Não afeta scroll vertical da página nem outras listas.

### Validação

- Abrir `/garcom/itens` em 390×844 — chips de categoria aparecem sem barra cinza embaixo.
- Arrastar lateralmente continua rolando entre as categorias.

