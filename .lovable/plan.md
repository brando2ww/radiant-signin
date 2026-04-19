

## Plano: serializar impressão por IP + retry automático

### 1. Fila por impressora (serial dentro do mesmo IP)

Em `print-bridge/server.js`, criar um mapa `printerQueues = Map<ip, Promise>`.

Em `processJob`, antes de chamar `sendToPrinter`:
- chave = `ip:port`
- encadear o trabalho na promise da fila daquela impressora:
  ```
  const prev = printerQueues.get(key) || Promise.resolve();
  const next = prev.then(() => doPrint()).catch(() => {});
  printerQueues.set(key, next);
  await next;
  ```
- isso garante 1 conexão TCP por vez **por impressora**, mas mantém paralelismo entre impressoras diferentes (COZINHA1 e SASHIMI continuam imprimindo ao mesmo tempo)

### 2. Retry automático com backoff

Constantes:
- `MAX_ATTEMPTS = 3`
- delays: 1s, 3s

Em `processJob` no bloco de erro TCP:
- se `job.attempts < MAX_ATTEMPTS`: marcar `status='pending'` (não `failed`), aguardar delay, reenfileirar (chamar `processJob` de novo)
- se atingiu max: marcar `failed` como hoje

Erros que **não** devem retry: "sem impressora configurada" (continua `failed` na hora).

### 3. Pequena pausa entre prints na mesma impressora

Após `sendToPrinter` resolver com sucesso, aguardar 300ms antes de liberar a fila daquele IP. Dá tempo da impressora térmica fechar o socket e processar buffer interno antes da próxima conexão.

### 4. Log mais claro

- `🔁 Retry 1/3 do job ... em 1s` quando reagendar
- `⏳ Aguardando fila de 192.168.3.95 (2 jobs à frente)` quando empilhar

### 5. Validação

1. Enviar comanda com 5+ itens na mesma impressora → todos imprimem em sequência, zero timeout
2. Enviar comanda com itens em impressoras diferentes → impressão paralela mantida
3. Desligar uma impressora → 3 tentativas com backoff, depois `failed`
4. Religar impressora e usar `/reprint` → imprime normalmente

### Arquivo

- `print-bridge/server.js` — adicionar fila por IP, retry, delay pós-print

### Resultado esperado

- Fim dos timeouts quando a comanda tem múltiplos itens na mesma impressora
- Falhas transitórias (rede momentânea) se autorrecuperam sem ação manual
- Throughput total mantido (impressoras diferentes continuam paralelas)

