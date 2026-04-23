

## Aplicar fonte Montserrat em toda a área do garçom (`/garcom/*`)

Hoje a área do garçom usa a fonte padrão herdada do `body` (sem `font-family` definido). Vou padronizar tudo dentro do `/garcom` para usar **Montserrat**, sem afetar o restante do app (PDV, delivery, super admin etc.).

### Mudanças

**1. Carregar a fonte Montserrat (`index.html`)**

Adicionar no `<head>` o preconnect e o link do Google Fonts com os pesos usados (400, 500, 600, 700):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**2. Registrar `font-montserrat` no Tailwind (`tailwind.config.ts`)**

Adicionar dentro de `theme.extend`:

```ts
fontFamily: {
  montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
},
```

**3. Aplicar a fonte no escopo do garçom (`src/pages/Garcom.tsx`)**

Adicionar a classe `font-montserrat` no wrapper raiz:

```tsx
<div className="min-h-screen bg-background pb-28 font-montserrat">
```

Como o Tailwind herda `font-family` por CSS, todos os filhos (rotas, BottomTabBar, FAB, headers, sheets, dialogs renderizados dentro desse container, cards de mesa/comanda, formulários do garçom) passarão a usar Montserrat automaticamente.

**4. Garantir Montserrat em portais (Sheets/Dialogs do Radix)**

`NewOrderSheet`, `ComandaDialog`, `MobileProductOptionSelector` e dropdowns são renderizados via portal no `<body>`, fora do wrapper. Para que também usem Montserrat enquanto o usuário estiver em `/garcom`, vou adicionar uma regra simples em `src/index.css`:

```css
body:has([data-garcom-root]) [data-radix-portal],
body:has([data-garcom-root]) [role="dialog"] {
  font-family: 'Montserrat', system-ui, sans-serif;
}
```

E marcar o wrapper do garçom com `data-garcom-root`:

```tsx
<div data-garcom-root className="min-h-screen bg-background pb-28 font-montserrat">
```

### Escopo

- Afeta **somente** rotas `/garcom/*` (mesas, comandas, comanda detalhe, adicionar item, cozinha, itens, FAB, BottomTabBar, sheets/dialogs abertos a partir do garçom).
- **Não afeta** PDV, Delivery, páginas públicas, Super Admin, login.

### Validação

- Abrir `/garcom`, `/garcom/comandas`, `/garcom/cozinha`, abrir o FAB e o NewOrderSheet — todos os textos devem renderizar em Montserrat.
- Abrir `/pdv` em outra aba — fonte permanece a padrão atual (sem alteração).

