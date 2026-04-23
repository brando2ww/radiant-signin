

## Mover a pílula para a esquerda para liberar espaço ao FAB

Hoje a pílula do `BottomTabBar` está centralizada (`left-1/2 -translate-x-1/2`) e o FAB no canto direito acaba sendo cortado/encavalado pela borda da tela em viewports estreitos.

### Mudança

Arquivo: `src/components/garcom/BottomTabBar.tsx`

- Trocar o posicionamento da `<nav>` de centralizado para ancorado à esquerda, com a mesma margem que o FAB tem da borda direita.
- De: `fixed left-1/2 -translate-x-1/2 z-50`
- Para: `fixed left-4 right-[5.5rem] z-50 flex justify-center`
  - `right-[5.5rem]` reserva ~88px para o FAB (h-14 = 56px + `right-4` = 16px + folga de 16px).
  - `flex justify-center` mantém a pílula centrada dentro do espaço restante (visualmente equilibrada à esquerda do FAB).
- A pílula em si (div interna com `rounded-full`) continua se ajustando ao conteúdo (`inline-flex` por padrão via `flex items-center`), então não vira uma barra esticada.

### Resultado

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│        ┌──────────────────────────────┐    ┌────┐       │
│        │ Mesas Comandas + Itens Coz.  │    │FAB │       │
│        └──────────────────────────────┘    └────┘       │
└─────────────────────────────────────────────────────────┘
```

A pílula desloca um pouco para a esquerda em telas estreitas, e o FAB aparece inteiro à direita, sem sobreposição.

### Validação

- Em mobile estreito (375px) o FAB aparece completo, sem encostar na pílula.
- Em telas largas, a pílula continua visualmente centrada (porque o espaço lateral à esquerda equilibra o reservado ao FAB à direita — para perfeição absoluta podemos usar `left-[5.5rem] right-[5.5rem]` para simetria; manter assim).
- Revisão final: usar `left-[5.5rem] right-[5.5rem] flex justify-center` para a pílula ficar perfeitamente centrada entre as duas margens iguais.

