

## Problema

Itens do garçom não estão imprimindo na cozinha. O Print Bridge escuta apenas eventos `INSERT` no Realtime, mas no fluxo do garçom o item é INSERIDO no carrinho ainda como rascunho — e depois um UPDATE seta `sent_to_kitchen_at` quando o garçom clica "Enviar para Cozinha". O bridge não escuta UPDATE → não imprime.

Adicional: mesmo no fluxo PDV salão, o bridge imprime no INSERT sem checar se o item realmente foi enviado para cozinha (`sent_to_kitchen_at IS NOT NULL`), então pode imprimir cedo demais ou imprimir itens cancelados/excluídos.

## Solução

### 1. `print-bridge/server.js` — escutar UPDATE também

Adicionar listeners de `UPDATE` em `pdv_comanda_items` e `pdv_order_items`. No handler:
- Só imprimir se `sent_to_kitchen_at` mudou de `null` para um valor (transição "enviado agora").
- Comparar `payload.old.sent_to_kitchen_at` (null) com `payload.new.sent_to_kitchen_at` (não-null).
- Manter dedupe via `processedIds` para não imprimir 2x.

### 2. `print-bridge/server.js` — INSERT só imprime se já vier com `sent_to_kitchen_at`

No handler de INSERT, checar `payload.new.sent_to_kitchen_at`. Se for null, ignorar (será impresso quando o UPDATE acontecer). Isso cobre o fluxo PDV salão (Balcão), onde itens são criados já como `entregue` ou já enviados.

### 3. Reforço nas views `vw_print_bridge_*`

As views já expõem `sent_to_kitchen_at`. Sem mudança necessária — o bridge pode usar esse campo para validar antes de imprimir (defesa adicional).

### Comportamento resultante

- **Garçom adiciona item**: INSERT chega ao bridge sem `sent_to_kitchen_at` → bridge ignora.
- **Garçom clica "Enviar para Cozinha"**: UPDATE seta `sent_to_kitchen_at` → bridge recebe UPDATE, valida que `old.sent_to_kitchen_at = null` e `new.sent_to_kitchen_at != null` → imprime.
- **PDV salão / Balcão (item já criado enviado)**: INSERT chega com `sent_to_kitchen_at` preenchido → bridge imprime na hora.
- **Edição de item depois de enviado** (ex: mudar quantidade): bridge não reimprime (não há nova transição null→valor).

### Observação importante

O Print Bridge roda **localmente** na máquina do estabelecimento (PM2 / Node). Após este ajuste, o usuário precisará **reiniciar o serviço** (`pm2 restart velara-print-bridge` ou parar/iniciar `npm start`) para que as mudanças entrem em efeito. Vou destacar isso na resposta final.

## Arquivos
- `print-bridge/server.js` — único arquivo alterado.

