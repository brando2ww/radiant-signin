

## Adicionar funcionalidade de "Duplicar" produto (PDV e Delivery)

### O que muda

**1. `src/components/pdv/ProductCard.tsx`**
- Adicionar item "Duplicar" no DropdownMenu (icone `Copy`)
- Nova prop `onDuplicate: (product: PDVProduct) => void`

**2. `src/pages/pdv/Products.tsx`**
- Implementar `handleDuplicate`: chama `createProduct` com os dados do produto original (sem id), adicionando " (cópia)" ao nome

**3. `src/components/delivery/ProductList.tsx`**
- Adicionar botao "Duplicar" (icone `Copy`) ao lado dos botoes existentes no `ProductListItem`
- Usar `useCreateProduct` para inserir copia do produto com " (cópia)" no nome, mesma categoria e dados

### Comportamento
- Duplica todos os campos do produto exceto `id`, `created_at`, `updated_at`
- Nome recebe sufixo " (cópia)"
- Toast de sucesso ao duplicar
- Produto duplicado aparece na lista apos invalidacao do cache

