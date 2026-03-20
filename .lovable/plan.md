

## Botão "Novo" — Escolher Mesa ou Comanda Avulsa

### Problema
Atualmente o botão "Novo" cria uma comanda avulsa diretamente, sem perguntar onde vincular o pedido.

### Solução
Ao clicar em "Novo", abrir um **bottom sheet** com duas opções:
1. **Mesa** — Navega para a tela de mesas (`/garcom`) para o garçom selecionar a mesa
2. **Comanda Avulsa** — Cria uma comanda sem mesa (balcão, delivery, etc.)

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/garcom/NewOrderSheet.tsx` | **Criar** — Sheet com duas opções: "Abrir em Mesa" e "Comanda Avulsa" |
| `src/pages/Garcom.tsx` | Substituir `handleNewComanda` direto por state que abre o sheet; passar callbacks para as duas opções |
| `src/components/garcom/BottomTabBar.tsx` | Sem mudança (já chama `onNewComanda`) |

### UX do Sheet
```text
┌──────────────────────────┐
│   Novo Pedido            │
│                          │
│  ┌────────┐ ┌──────────┐ │
│  │ 🪑     │ │ 📋       │ │
│  │ Mesa   │ │ Comanda  │ │
│  │        │ │ Avulsa   │ │
│  └────────┘ └──────────┘ │
└──────────────────────────┘
```

Ao escolher "Mesa" → navega para `/garcom` (grid de mesas).
Ao escolher "Comanda Avulsa" → cria comanda sem `order_id` e navega para detalhe.

