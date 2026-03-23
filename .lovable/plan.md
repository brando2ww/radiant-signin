

## Fix: Header duplicado na página de Cupons

A página `Coupons.tsx` renderiza um header "Cupons de Desconto" e o componente `CouponsTab` também renderiza seu próprio header "Cupons de Desconto". Resultado: título duplicado.

### Mudança

**`src/pages/pdv/delivery/Coupons.tsx`** — remover o header da página wrapper, já que o `CouponsTab` já tem o seu próprio:

```tsx
export default function DeliveryCoupons() {
  return (
    <div className="container mx-auto py-6 px-4">
      <CouponsTab />
    </div>
  );
}
```

