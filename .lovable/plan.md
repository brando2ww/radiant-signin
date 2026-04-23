

## Mover FAB para o lado do bottom menu

Hoje o `GarcomActionFab` está flutuando bem acima da pílula de navegação (a ~5rem do rodapé). A ideia é trazê-lo para baixo, alinhado à mesma linha horizontal da pílula flutuante, mas no canto direito da tela.

### Mudança

Arquivo: `src/components/garcom/GarcomActionFab.tsx`

- Trocar a posição vertical do container do FAB de `bottom-[calc(5rem+env(safe-area-inset-bottom))]` para `bottom: calc(1.25rem + env(safe-area-inset-bottom))`.
  - Isso faz o centro do FAB (h-14 = 56px) coincidir com o centro da pílula do `BottomTabBar` (que está em `bottom: 1rem` e tem ~64px de altura útil).
- Manter `right-4` (canto direito) e `z-40`.
- O menu expandido continua subindo a partir do FAB (mini FABs empilhados verticalmente), sem colidir com a pílula porque ela é central e o FAB fica na lateral direita.

### Resultado visual

```text
                                                     ┌──────┐
   ┌──────────────────────────────────┐              │ FAB  │
   │  Mesas  Comandas  +  Itens  ...  │              │  ⋯   │
   └──────────────────────────────────┘              └──────┘
   (pílula flutuante centralizada)              (mesma altura, à direita)
```

### Validação

- Em mobile e desktop, o botão circular do FAB aparece na mesma faixa horizontal da pílula, encostado à direita.
- Ao tocar, o menu de ações (Tema, Gerente, Sair) ainda expande para cima, sem sobrepor a pílula.
- Safe-area do iPhone preservada.

