

## Diagnóstico atual

Pelo código atual, o fluxo principal já está implementado:

- `src/hooks/use-pdv-comandas.ts`
  - ao clicar em **Enviar para Cozinha**, ele atualiza `sent_to_kitchen_at` dos itens selecionados
  - também busca os filhos compostos por `parent_item_id` e envia junto
- `print-bridge/server.js`
  - já escuta `INSERT` e `UPDATE` em `pdv_comanda_items` e `pdv_order_items`
  - no `UPDATE`, imprime quando `sent_to_kitchen_at` muda de `null` para valor

Então, se **nenhuma comanda imprimiu**, o problema mais provável agora não é o botão do garçom em si, e sim um destes pontos:

1. o **Print Bridge local** ainda está com código antigo / não foi reiniciado  
2. o bridge está rodando, mas **não está conectado no Realtime**
3. os itens enviados chegam à view de impressão **sem `printer_ip`**
4. os itens nem chegaram com `sent_to_kitchen_at` no banco
5. a conexão com a impressora falha no bridge local

## Plano

### 1. Validar o dado real da comanda enviada
Conferir no banco, para a comanda testada, se:
- os itens pai e filhos existem
- `sent_to_kitchen_at` foi preenchido após clicar em enviar
- cada item ficou com `production_center_id`
- a view `vw_print_bridge_comanda_items` retorna `center_name`, `printer_ip` e `printer_port`

Isso separa rapidamente:
- problema de **frontend/envio**
vs
- problema de **bridge/impressão**

### 2. Validar o estado do Print Bridge local
Inspecionar `print-bridge/server.js` e o ambiente local para confirmar:
- a máquina está usando a **versão nova** do bridge
- o processo foi **reiniciado**
- o canal Realtime entrou em `SUBSCRIBED`
- os eventos `UPDATE` de `pdv_comanda_items` estão chegando
- se há logs como:
  - item sem `printer_ip`
  - erro de conexão TCP
  - timeout
  - `handleComandaItem` sem retorno da view

### 3. Se o banco estiver certo e o bridge não reagir, ajustar o bridge
Se confirmado que os itens foram enviados corretamente mas nada chega/imprime, ajustar `print-bridge/server.js` para deixar o diagnóstico explícito, com logs para:
- recebimento do payload de `INSERT/UPDATE`
- transição `old.sent_to_kitchen_at -> new.sent_to_kitchen_at`
- resultado da busca na `vw_print_bridge_comanda_items`
- motivo de ignorar o item
- tentativa de impressão por IP/porta

### 4. Se a view estiver sem IP/centro, corrigir roteamento/configuração
Se os itens enviados chegarem sem `printer_ip`:
- revisar a resolução em `src/utils/resolveProductionCenter.ts`
- revisar os `slugs` dos centros e `printer_station` dos produtos/subprodutos
- confirmar se os centros do tenant dono têm impressora configurada

### 5. Validar ponta a ponta com produto simples e composto
Depois do ajuste:
- testar 1 item simples
- testar 1 item composto
- confirmar:
  - pai enviado
  - filhos enviados
  - cada filho indo para o centro correto
  - bridge recebendo evento
  - impressão acontecendo na impressora certa

## Arquivos envolvidos

- `src/hooks/use-pdv-comandas.ts`
- `src/utils/resolveProductionCenter.ts`
- `src/utils/expandComposition.ts`
- `print-bridge/server.js`

## Detalhes técnicos

```text
Garçom -> sendToKitchen()
       -> UPDATE pdv_comanda_items.sent_to_kitchen_at
       -> Realtime no Print Bridge
       -> handleComandaItem(id)
       -> SELECT vw_print_bridge_comanda_items
       -> row.printer_ip ?
          ├─ não -> ignora/loga
          └─ sim -> TCP 9100 -> impressora
```

## Resultado esperado

Após a implementação/validação:
- clicar em **Enviar para Cozinha** gera impressão
- isso funciona para item simples e produto composto
- se algo impedir a impressão, o motivo fica visível no log do bridge

