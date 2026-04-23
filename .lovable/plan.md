

## Aumentar a largura da pílula do bottom menu

Hoje a pílula está em `left-3 right-20`, o que reserva 80px à direita para o FAB de 56px. A pílula fica curta e os ícones ficam apertados. Vou reduzir a folga reservada à direita e encolher levemente o FAB para a pílula esticar mais.

### Mudança

**`src/components/garcom/BottomTabBar.tsx`**

- Trocar `fixed left-3 right-20 z-50 ...` por `fixed left-2 right-[4.5rem] z-50 ...`.
  - `left-2` (8px) gruda a pílula ainda mais à esquerda.
  - `right-[4.5rem]` (72px) reserva o mínimo necessário ao FAB (48px + 16px de margem + 8px de respiro).
- Aumentar o padding interno horizontal da pílula de `px-2` para `px-3` para os tabs respirarem melhor com a nova largura.
- Aumentar o `gap-1` entre tabs para `gap-2`.

**`src/components/garcom/GarcomActionFab.tsx`**

- Reduzir o FAB principal de `h-14 w-14` para `h-12 w-12` (48px) para liberar espaço lateral.
- Manter o FAB em `right-4` para preservar o respiro contra a borda direita.

### Resultado em mobile (390px)

```text
┌──────────────────────────────────────────────┐
│ ┌───────────────────────────────────┐ ┌────┐ │
│ │ Mesas  Comandas  +  Itens  Coz.   │ │FAB │ │
│ └───────────────────────────────────┘ └────┘ │
└──────────────────────────────────────────────┘
   pílula bem mais larga              FAB completo
```

### Validação

- Em 390px (viewport atual) a pílula ocupa ~310px de largura útil (antes ~290px) e os 5 itens + Plus ficam mais espaçados.
- O FAB continua aparecendo por completo, sem encavalar a pílula.
- Safe-area do iPhone preservada (sem alteração no `bottom`).

