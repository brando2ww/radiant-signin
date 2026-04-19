

## Plano: agrupar itens da mesma comanda + impressora em um único papel

### Problema atual
Cada item vira 1 job → 1 papel. Se "Água" e "Coca" vão para a mesma impressora na mesma comanda, saem 2 papéis separados. Desperdício de bobina e dificulta o trabalho do bar/cozinha.

### Solução
Agrupar no momento do envio para cozinha: 1 job por (comanda + impressora), contendo a lista de itens.

### Mudança 1 — `src/hooks/use-pdv-comandas.ts`

Em `sendToKitchenMutation`, após buscar os dados da view `vw_print_bridge_comanda_items`:

- Agrupar `viewRows` por chave `comanda_id + production_center_id`
- Para cada grupo, gerar **1 job** com:
  - `payload.items: [{ product_name, quantity, notes, modifiers, parent_product_name, is_composite_child }, ...]`
  - `payload.comanda_number`, `customer_name`, `kind: "comanda"` no nível raiz
  - `source_item_id`: id do primeiro item do grupo (ou criar coluna `source_item_ids[]` futuramente)

Resultado: se 5 itens vão para COZINHA1 da mesma comanda, é gerado 1 job só.

### Mudança 2 — `print-bridge/server.js`

Em `buildReceipt`, detectar se `payload.items` é array:

- Se for array (novo formato): cabeçalho com comanda/cliente uma vez, depois loop imprimindo cada item (nome, qtd, obs, modifiers) com separador entre eles
- Se não for (formato antigo, retrocompatibilidade): comportamento atual de 1 item por papel

Layout sugerido do papel agrupado:
```
====================
COZINHA1
Comanda 20260419-001
Cliente: João
====================
2x Água sem Gas
1x Coca-Cola
   - Sem gelo
3x Pastel de Carne
   (do Combo Promo)
====================
19/04 14:32
```

### Mudança 3 — retrocompatibilidade
Manter suporte ao payload antigo (`product_name` no topo) para jobs já enfileirados antes do deploy.

### Validação
1. Comanda com 3 itens da mesma impressora → sai 1 papel com os 3
2. Comanda com itens de 2 impressoras diferentes → sai 1 papel em cada (1 com os itens daquela estação)
3. Item composto (combo) → filhos aparecem agrupados no papel da impressora correspondente, com indicação do pai

### Arquivos
- `src/hooks/use-pdv-comandas.ts` — agrupar antes de inserir em `pdv_print_jobs`
- `print-bridge/server.js` — `buildReceipt` lê array `items`

### Ação após deploy
1. Atualizar `server.js` no PC do bridge
2. `pm2 restart velara-print-bridge`
3. Enviar comanda de teste com 2+ itens na mesma impressora

