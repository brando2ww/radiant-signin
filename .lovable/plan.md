

## Plano: Fila de impressão `pdv_print_jobs` + bridge resiliente

### 1. Migration — criar fila e infraestrutura

Nova tabela `pdv_print_jobs` com snapshot completo:

- `id uuid pk default gen_random_uuid()`
- `tenant_user_id uuid not null` — dono do estabelecimento
- `source_kind text not null check (source_kind in ('comanda','order'))`
- `source_item_id uuid not null` — id do item original
- `center_id uuid` / `center_name text`
- `printer_ip text` / `printer_port int`
- `payload jsonb not null` — snapshot: product_name, quantity, notes, modifiers, comanda_number, customer_name, order_number, table_number, parent_product_name, is_composite_child
- `status text not null default 'pending'` — pending, printing, printed, failed
- `attempts int not null default 0`
- `error_message text`
- `created_at timestamptz default now()`
- `printed_at timestamptz`

Índices:
- `idx_print_jobs_status_created on (status, created_at)`
- `idx_print_jobs_tenant on (tenant_user_id)`

RLS:
- INSERT permitido para `authenticated` quando `tenant_user_id = auth.uid()` OU `is_establishment_member(tenant_user_id)`
- SELECT permitido para `anon` e `authenticated` (bridge usa anon key)
- UPDATE permitido para `anon` e `authenticated` (bridge marca printed/failed)

Realtime:
- `ALTER PUBLICATION supabase_realtime ADD TABLE pdv_print_jobs`
- `ALTER TABLE pdv_print_jobs REPLICA IDENTITY FULL`

### 2. App — gravar jobs no envio para cozinha

Em `src/hooks/use-pdv-comandas.ts`, dentro de `sendToKitchenMutation`:

Após o `UPDATE` de `sent_to_kitchen_at`:
1. Consultar a `vw_print_bridge_comanda_items` para os ids enviados (pais + filhos)
2. Para cada linha retornada, montar o payload snapshot
3. `INSERT` em `pdv_print_jobs` (uma linha por item com impressora)
4. Itens sem `printer_ip` viram job com `status='failed'` + `error_message='sem impressora configurada'` (para ficarem visíveis no painel)

Mesmo tratamento será replicado no fluxo equivalente de `pdv_order_items` se houver hook similar usado pelo balcão/salão.

### 3. Bridge — escutar fila e reprocessar

Em `print-bridge/server.js`:

**Subscribe**:
- Trocar assinatura de `pdv_comanda_items`/`pdv_order_items` por `pdv_print_jobs` (INSERT, status='pending')
- Manter conexão Realtime existente apenas como fallback opcional (ou remover)

**Processamento de job**:
1. Marcar `status='printing'`, `attempts = attempts + 1`
2. Normalizar IP (já existe), montar receipt a partir do `payload`
3. TCP 9100
4. Sucesso → `status='printed'`, `printed_at=now()`
5. Falha → `status='failed'`, `error_message=...`

**Reprocessamento on-boot**:
- Ao iniciar, buscar `status='pending'` com `created_at > now() - interval '2 hours'` filtrando pelo `tenant_user_id` do estabelecimento (via `ESTABLISHMENT_NAME` resolvido)
- Processar em ordem cronológica

**Estado interno** (em memória) para `/health`:
- `last_job_at`, `last_print_at`, `last_error`, `jobs_processed`, `subscription_status`

**Endpoint `/health`** retorna:
```json
{
  "status": "ok",
  "subscription_status": "subscribed",
  "last_job_at": "...",
  "last_print_at": "...",
  "last_error": null,
  "jobs_processed": 12,
  "pending_jobs_count": 0
}
```
- `pending_jobs_count` consultado on-demand na fila

**Endpoint `/reprint`**: aceitar `{ jobId }` para reenfileirar um job específico (volta para pending).

### 4. Validação ponta-a-ponta

1. Enviar item simples → conferir job criado, evento Realtime, impressão, `status='printed'`
2. Enviar produto composto → N jobs (1 por filho com impressora), todos impressos
3. Parar bridge, enviar comanda, religar bridge → reprocessamento automático imprime
4. Item sem impressora → job `failed` com mensagem clara

### Arquivos

- `supabase/migrations/...sql` — tabela, RLS, índices, publication
- `src/hooks/use-pdv-comandas.ts` — insert na fila após sendToKitchen
- `print-bridge/server.js` — assinar fila, reprocessar on-boot, `/health` enriquecido, `/reprint` por jobId
- `print-bridge/README.md` — atualizar fluxo

### Resultado esperado

- Envio para cozinha sempre gera job persistente
- Bridge offline não perde comanda (reprocessa em até 2h)
- `/health` mostra status real e contagem de pendentes
- Falhas ficam rastreáveis por job no banco

