

## Aplicar o visual das mesas do PDV (Salão) na tela de mesas do garçom

Hoje as mesas em `/garcom` aparecem como botões coloridos retangulares. Vou trocar por um card no **mesmo padrão visual do Salão do PDV**: card branco com borda do setor, etiqueta de setor no topo, ponto de status no canto, ilustração da mesa com cadeiras ao redor e label "X lugares" embaixo — como no print que você enviou.

### Mudanças

**1. `src/components/garcom/MesaCard.tsx` — substituir o card atual**

Reescrever para reproduzir o `TableCard.tsx` do PDV, simplificado para mobile:

- Card branco (`bg-card`) com sombra suave, cantos arredondados.
- Borda colorida (2px) com a cor do setor; etiqueta com o nome do setor flutuante no topo-esquerdo.
- Ponto de status (verde/laranja/vermelho/etc) no canto superior direito.
- Ilustração central da mesa: forma `square` (retângulo arredondado) ou `round` (círculo), com cadeirinhas posicionadas em cima/embaixo/lados conforme a capacidade — usando o mesmo helper `getChairLayout` do `TableCard`.
- Dentro da mesa: label `M{numero}` em destaque; quando ocupada, exibe também `R$ total`, tempo e contagem de comandas (se vier).
- Embaixo, label `{capacity} lugares` em texto suave.
- Cores de mesa/cadeiras por status seguem a paleta do Salão do PDV (livre = muted, ocupada = laranja, conta = vermelho, pagamento = roxo, etc).

Aceitar novos props opcionais para enriquecer o visual:
- `shape?: "square" | "round"`
- `sectorColor?: string`
- `sectorName?: string`
- `orderTotal?: number`
- `orderTime?: string`
- `comandaCount?: number`

**2. `src/pages/garcom/GarcomMesas.tsx` — passar setor + dados de pedido**

- Carregar setores do `usePDVSectors()` e pedidos ativos do `usePDVOrders()` (já usados no PDV).
- Para cada mesa, resolver `sectorColor`/`sectorName` pelo `sector_id` e calcular `orderTotal` / `orderTime` do pedido ativo associado.
- Aumentar a altura mínima dos cards (mesas com cadeiras precisam de ~150px) e ajustar o grid para `grid-cols-2` em mobile (ficou apertado em 3 colunas com cadeiras visíveis); manter `grid-cols-3` em telas maiores via `sm:grid-cols-3`.
- Skeleton com nova altura.

### Resultado visual

```text
┌────────────────────┐  ┌────────────────────┐
│ ▮ SALÃO PRINCIPAL  │  │ ▮ SALÃO PRINCIPAL  │
│                  ● │  │                  ● │
│   ▭ ▭              │  │     ▭ ▭            │
│ ▯ ░░░░░ ▯          │  │   ░░░░░░░          │
│ ▯  M2  ▯           │  │   ░ M4  ░          │
│ ▯ ░░░░░ ▯          │  │   ░░░░░░░          │
│   ▭ ▭              │  │     ▭ ▭            │
│   12 lugares       │  │   8 lugares        │
└────────────────────┘  └────────────────────┘
```

Mesmo desenho de mesa + cadeiras + badge de setor + status dot que aparece no PDV (Salão), idêntico ao print de referência.

### Escopo

- Afeta somente a tela `/garcom` (lista de mesas do garçom).
- Não muda o comportamento de navegação (clique continua abrindo `/garcom/mesa/:id`).
- Não altera o Salão do PDV nem o mapa.

### Validação

- Em 390×844, abrir `/garcom`: cards aparecem com mesa desenhada, cadeiras ao redor, badge "SALÃO PRINCIPAL" no topo, ponto verde quando livre, label "X lugares" embaixo.
- Mesa ocupada: cor da mesa muda, ponto fica laranja/vermelho conforme status, valor da comanda e tempo aparecem dentro da forma da mesa.
- Mesa redonda (`shape: round`): forma circular com cadeiras distribuídas em volta.
- Tocar no card continua navegando para `/garcom/mesa/:id`.

