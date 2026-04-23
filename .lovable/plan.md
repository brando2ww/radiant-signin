

## Encostar a pílula à esquerda da tela

A pílula ainda fica visualmente "no meio" porque está com `flex justify-center` num espaço com margens iguais dos dois lados. O FAB então parece encavalar a borda direita. Vou ancorar a pílula de fato à esquerda e reservar mais espaço seguro à direita para o FAB.

### Mudança

**`src/components/garcom/BottomTabBar.tsx`**

Trocar a `<nav>`:
- De: `fixed left-[5.5rem] right-[5.5rem] z-50 flex justify-center pointer-events-none`
- Para: `fixed left-3 right-20 z-50 flex justify-start pointer-events-none`
  - `left-3` (12px) cola a pílula à esquerda da tela.
  - `right-20` (80px) reserva folga para o FAB (56px + `right-4` 16px + 8px de respiro).
  - `justify-start` posiciona a pílula no início, não mais centralizada.

**`src/components/garcom/GarcomActionFab.tsx`**

- Subir o z-index do container do FAB de `z-40` para `z-50`, garantindo que ele sempre fique por cima caso o usuário gire o aparelho ou redimensione.

### Resultado

```text
┌──────────────────────────────────────────────┐
│                                              │
│ ┌──────────────────────────────┐    ┌────┐   │
│ │ Mesas Comandas + Itens Coz.  │    │FAB │   │
│ └──────────────────────────────┘    └────┘   │
└──────────────────────────────────────────────┘
   ↑ encostada à esquerda          ↑ aparece inteiro
```

A pílula fica bem à esquerda, o FAB fica completo no canto direito, e nenhum dos dois encosta no outro mesmo em telas estreitas.

