

## Plano: corrigir tela branca em /pdv/produtos causada por produto sem categoria

### Causa raiz
O produto "Monte seu prato 2" foi salvo com `category` vazia (string vazia/null no banco). Em `Products.tsx`, a lista de categorias únicas é montada e passada ao `ProductFilters.tsx`, que renderiza:

```tsx
<SelectItem key={cat} value={cat}>{cat}</SelectItem>
```

Radix UI Select **não aceita `value=""`** — isso lança exceção de runtime e quebra a página inteira (tela branca). Já é uma constraint conhecida do projeto (memória `select-component-constraints`).

Por que aconteceu agora: o `ProductDialog` permite criar produto sem preencher categoria (ou ela vai como string vazia), e o banco aceitou.

### Correções (3 frentes)

**1. `src/pages/pdv/Products.tsx` — filtrar categorias vazias**
Na construção das categorias únicas (linha ~56), excluir entradas vazias/null:
```ts
const cats = new Set(
  products
    .map((p) => p.category)
    .filter((c): c is string => !!c && c.trim() !== "")
);
```
Isso por si só já resolve a tela branca.

**2. `src/components/pdv/ProductFilters.tsx` — defesa extra**
Filtrar novamente antes de renderizar o `.map()`, garantindo que nenhum `SelectItem` receba string vazia mesmo se o pai passar.

**3. `src/components/pdv/ProductDialog.tsx` — prevenção**
Tornar o campo "Categoria" obrigatório no submit (validação simples: `if (!data.category?.trim()) return toast`), evitando criação futura de produtos sem categoria.

### Limpeza opcional do dado existente
Sugerir ao usuário (após o fix) editar o produto "Monte seu prato 2" e atribuir uma categoria correta. Não vou alterar dados do banco automaticamente.

### Validação
1. Recarregar `/pdv/produtos` → página renderiza normalmente.
2. Card de "Monte seu prato 2" aparece (sem categoria visível no filtro).
3. Editar o produto e definir categoria → card passa a aparecer no filtro.
4. Tentar criar novo produto sem categoria → toast de erro impede.

### Arquivos
- **Editado:** `src/pages/pdv/Products.tsx`
- **Editado:** `src/components/pdv/ProductFilters.tsx`
- **Editado:** `src/components/pdv/ProductDialog.tsx`

