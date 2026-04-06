

## Melhorar visual do Funil de Compra

### Problema
O funil atual usa barras horizontais com larguras proporcionais, mas quando os valores são 0 ou muito baixos, as barras ficam visualmente estranhas — barras coloridas grandes mostrando "0%" sem forma de funil real.

### Solução
Redesenhar o funil com um visual de **funil real em formato trapézio** — cada etapa é uma barra centralizada que vai ficando mais estreita, criando o efeito visual clássico de funil. Usar cores do sistema (sem gradientes coloridos, respeitando o design memory).

### Design proposto

```text
┌─────────────────────────────────┐
│    👁 Visualizaram    120       │  ← barra larga (100%)
│  ███████████████████████████    │
│                                 │
│    🛒 Add carrinho    45        │  ← barra média (~60%)
│     █████████████████████       │
│                                 │
│    ✅ Compraram       12        │  ← barra estreita (~30%)
│       ███████████████           │
│                                 │
│   Setas entre etapas com        │
│   taxa de conversão (37.5%)     │
└─────────────────────────────────┘
```

### Mudanças no arquivo `PurchaseFunnel.tsx`

1. **Layout de funil centralizado**: Barras centralizadas com `mx-auto`, largura decrescente, criando forma de funil
2. **Setas entre etapas**: Adicionar indicador visual (chevron/seta) entre cada etapa mostrando a taxa de conversão daquela transição
3. **Cores do sistema**: Usar `bg-primary`, `bg-muted-foreground`, `bg-muted` em vez de blue/amber/green gradients
4. **Valores dentro da barra**: Manter o número e percentual dentro da barra, mas com melhor contraste
5. **Largura mínima maior quando 0**: Quando todos os valores são 0, mostrar o formato de funil com larguras fixas proporcionais (100%, 65%, 35%) para manter a forma visual
6. **Cards de conversão**: Manter os 3 cards inferiores mas com ícones de seta entre eles

