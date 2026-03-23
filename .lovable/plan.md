

## Link Externo com Cupom Auto-aplicado

### Conceito
Cada cupom terá um link compartilhável no formato `/cardapio/:userId?cupom=CODIGO`. Quando o cliente acessa esse link, o cupom é validado e aplicado automaticamente no carrinho, sem precisar digitar.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/pages/PublicMenu.tsx` | Ler query param `cupom` da URL e passar para ShoppingCart |
| `src/components/public-menu/ShoppingCart.tsx` | Receber prop `initialCoupon`, auto-aplicar ao abrir carrinho com itens |
| `src/components/delivery/CouponsTab.tsx` | Adicionar botão "Copiar Link" em cada cupom ativo (gera URL com `?cupom=CODE`) |

### Detalhes

**1. PublicMenu.tsx**
- Usar `useSearchParams` para ler `?cupom=CODIGO`
- Passar `initialCoupon` como prop para `ShoppingCart`

**2. ShoppingCart.tsx**
- Nova prop `initialCoupon?: string`
- `useEffect`: quando `initialCoupon` existir e carrinho tiver itens e nenhum cupom aplicado, chamar `validateCoupon.mutate` automaticamente
- Mostrar toast de sucesso ao auto-aplicar

**3. CouponsTab.tsx**
- Buscar `userId` do auth context
- Construir URL: `{window.location.origin}/cardapio/{userId}?cupom={coupon.code}`
- Novo botão "Copiar Link" ao lado do "Copiar Código" em cada card de cupom ativo
- Ao clicar, copia o link completo e mostra toast

### Fluxo
1. Admin cria cupom → vê botão "Copiar Link" no card
2. Admin compartilha link no WhatsApp/Instagram
3. Cliente clica → abre cardápio → adiciona itens → abre carrinho → cupom já aplicado automaticamente

