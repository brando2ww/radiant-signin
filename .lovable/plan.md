

## App do Garçom — Interface Mobile-First Dedicada

### Visao Geral

Criar uma rota `/garcom/*` com layout mobile-first dedicado (sem o header do PDV desktop). Quando o usuário com role `garcom` faz login, é redirecionado para `/garcom` em vez de `/pdv/salao`. A interface reutiliza **todos os hooks existentes** (`use-pdv-tables`, `use-pdv-comandas`, `use-pdv-orders`, `use-pdv-kitchen`, `use-pdv-products`, `use-pdv-payments`, `use-pdv-cashier`) — apenas cria componentes de UI otimizados para mobile.

### Estrutura de Navegação (Bottom Tab Bar)

```text
┌──────────────────────────────┐
│                              │
│      Conteúdo da página      │
│                              │
├──────────────────────────────┤
│  Mesas  Comandas  Cozinha  + │
└──────────────────────────────┘
```

- **Mesas** — Mapa/grid de mesas com status (livre, ocupada, pediu conta)
- **Comandas** — Lista de comandas abertas (avulsas e de mesa)
- **Cozinha** — Status dos pedidos em preparo (somente visualização)
- **Menu (FAB +)** — Ação rápida: abrir nova comanda avulsa

### Telas do App

| Tela | Descrição | Hooks Reutilizados |
|------|-----------|-------------------|
| **Mesas** | Grid de mesas coloridas por status. Toque → abre detalhes da mesa | `use-pdv-tables`, `use-pdv-orders`, `use-pdv-comandas` |
| **Detalhe da Mesa** | Mostra comandas da mesa, botões: nova comanda, fechar mesa | `use-pdv-comandas`, `use-pdv-cashier` |
| **Comandas** | Lista de comandas abertas com busca | `use-pdv-comandas` |
| **Detalhe da Comanda** | Itens, status cozinha, ações: adicionar item, enviar cozinha, fechar | `use-pdv-comandas` |
| **Adicionar Item** | Busca de produtos por categoria, seleção, quantidade, observações | `use-pdv-products` |
| **Cozinha** | Cards de itens com status (pendente/preparando/pronto) | `use-pdv-kitchen` |
| **Chamar Gerente** | Botão no header que dispara notificação (toast por enquanto) | — |

### Fluxo Principal

1. Garçom abre app → vê grid de mesas
2. Toca mesa livre → cria pedido (se caixa aberto) → abre comanda
3. Na comanda → adiciona itens → envia para cozinha
4. Acompanha status na aba Cozinha
5. Cliente pede conta → garçom fecha comanda → envia para caixa

### Arquivos Novos

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/Garcom.tsx` | Layout principal com bottom tab bar e rotas internas |
| `src/pages/garcom/GarcomMesas.tsx` | Grid de mesas mobile-first |
| `src/pages/garcom/GarcomMesaDetalhe.tsx` | Sheet/page com detalhes da mesa e comandas |
| `src/pages/garcom/GarcomComandas.tsx` | Lista de comandas abertas |
| `src/pages/garcom/GarcomComandaDetalhe.tsx` | Detalhes da comanda, itens, ações |
| `src/pages/garcom/GarcomAdicionarItem.tsx` | Catálogo de produtos mobile com busca por categoria |
| `src/pages/garcom/GarcomCozinha.tsx` | Visualização de status dos pedidos |
| `src/components/garcom/BottomTabBar.tsx` | Barra de navegação inferior fixa |
| `src/components/garcom/GarcomHeader.tsx` | Header compacto com nome do garçom e botão "Chamar Gerente" |
| `src/components/garcom/MesaCard.tsx` | Card de mesa otimizado para toque |
| `src/components/garcom/ComandaItemCard.tsx` | Card de item na comanda com controles de quantidade |
| `src/components/garcom/ProductCategoryNav.tsx` | Navegação horizontal de categorias de produtos |

### Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/garcom/*` protegida por `ProtectedRoute` |
| `src/pages/Index.tsx` | Redirecionar role `garcom` para `/garcom` em vez de `/pdv/salao` |
| `src/hooks/use-user-role.ts` | Alterar `defaultRoute` do garçom para `/garcom` |
| `src/components/ProtectedRoute.tsx` | Permitir acesso a `/garcom/*` para role garçom (não redirecionar para `/pdv`) |

### Design Mobile

- Touch targets mínimos de 44px
- Cards grandes e bem espaçados
- Cores de status vibrantes (verde=livre, vermelho=ocupada, amarelo=aguardando)
- Swipe gestures onde fizer sentido
- Sem menus dropdown — tudo com botões visíveis
- Bottom sheet para detalhes em vez de dialogs modais quando possível
- Font sizes maiores para leitura rápida

### Sem Mudanças no Backend

Nenhuma migração SQL necessária. Todos os dados já existem nas tabelas `pdv_tables`, `pdv_orders`, `pdv_comandas`, `pdv_comanda_items`, `pdv_products`. Os hooks existentes já fazem todas as operações necessárias.

