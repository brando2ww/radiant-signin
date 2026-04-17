

Deixa eu explorar o estado atual antes de planejar.
<lov-tool-use id="toolu_015R84ZyQ2DxREAfd5BBxbUh" name="code--exec" integration-id="code" data="{\"command\": \"psql -c \\\"\\\\d pdv_production_centers\\\" 2>&1 | head -40\", \"user_facing_description\": \"Inspecionando a estrutura atual da tabela de centros de produção\"}">
</lov-tool-use>

<lov-tool-use id="toolu_01Meuhd65fxSQ5piPYqt2rij" name="code--exec" integration-id="code" data="{\"command\": \"psql -c \\\"\\\\d pdv_order_items\\\" 2>&1 | head -40 && echo \\\"---\\\" && psql -c \\\"\\\\d pdv_comanda_items\\\" 2>&1 | head -40\", \"user_facing_description\": \"Inspecionando a estrutura das tabelas de itens de pedido\"}">
</lov-tool-use>

<lov-tool-use id="toolu_01BU76i79nHaz4vhWxe4PJdw" name="code--exec" integration-id="code" data="{\"command\": \"psql -c \\\"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='pdv_products' AND (column_name LIKE '%printer%' OR column_name LIKE '%production%' OR column_name LIKE '%station%');\\\" 2>&1\", \"user_facing_description\": \"Verificando como produtos apontam para centros de produção hoje\"}">
</lov-tool-use>
I'm in READ-ONLY plan mode — can't exec. Let me use supabase read_query and code--view instead.
<lov-tool-use id="toolu_01HykkMUxQ9Poin43VZzxU3o" name="supabase--read_query" integration-id="supabase" data="{\"query\": \"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('pdv_production_centers','pdv_order_items','pdv_comanda_items','delivery_order_items','pdv_products') ORDER BY table_name, ordinal_position;\"}">
</lov-tool-use>

<lov-tool-use id="toolu_01Gpb3oUSviL2dsUz3nXnF41" name="code--search_files" integration-id="code" data="{\"query\": \"printer_station|production_center_id\", \"include_patterns\": \"src/**/*.ts,src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_01FCemYFarRVRnWfA58QK2jy" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/pdv/ProductDialog.tsx\", \"lines\": \"420-480\"}">
</lov-tool-use>

<lov-tool-use id="toolu_015RM7BFkLNqoVfJ7RgAwhy1" name="supabase--read_query" integration-id="supabase" data="{\"query\": \"SELECT DISTINCT printer_station FROM pdv_products LIMIT 20;\"}">
</lov-tool-use>
Key findings:
- `pdv_production_centers` has `printer_name` (text) but **no `printer_ip` / `printer_port`** columns yet.
- `pdv_products.printer_station` is `text` (stores slug like "cozinha"/"bar"), NOT a FK to `pdv_production_centers.id`.
- `pdv_order_items`, `pdv_comanda_items`, `delivery_order_items` have no `production_center_id`.
- Kitchen page uses `printer_station` slug today via a live join to `pdv_products`.

Also note: Next.js API endpoint (`/api/test-print`) doesn't fit — this is a Vite/React app. The test-print must run locally against the Print Bridge (e.g., via a small HTTP server inside the bridge itself on localhost:7777).

<lov-plan>

# Impressão real por centro de produção — Print Bridge

Implementação em 5 partes. A arquitetura funciona: tablet grava em Supabase → Print Bridge (PC do caixa) escuta Realtime → imprime via TCP 9100 na térmica correspondente. Abaixo o que precisa ser ajustado/criado, com as correções exigidas pelo estado atual do projeto.

## Ajustes ao plano original (obrigatórios)

1. **`pdv_production_centers` não tem `printer_ip` nem `printer_port`** — só `printer_name`. Vou adicionar ambas as colunas e migrar `printer_name` → `printer_ip` quando parecer IP.
2. **`pdv_products.printer_station` é texto (slug), não FK.** Vou manter o campo como fallback e adicionar um helper que resolve `slug → production_center_id` no momento do lançamento (evita migração destrutiva agora). `resolveProductionCenterId` aceita `productId` e retorna o UUID do centro via join por slug.
3. **Projeto é Vite/React, não Next.js.** Não existe `/api/test-print`. Solução: o próprio Print Bridge sobe um mini servidor HTTP local (`localhost:7777`) com endpoint `POST /test-print`. A tela chama esse endpoint direto do navegador do caixa. Se o bridge não estiver rodando, o toast mostra “Print Bridge offline”.
4. **View `vw_print_bridge_items`**: hoje não existe `delivery_order_items` unificado com `pdv_order_items`. Crio **duas views** (`vw_print_bridge_order_items` e `vw_print_bridge_comanda_items`) para o bridge escutar as duas tabelas.

---

## PARTE 1 — Migração SQL

```sql
-- 1. IP/porta nos centros
ALTER TABLE pdv_production_centers
  ADD COLUMN IF NOT EXISTS printer_ip TEXT,
  ADD COLUMN IF NOT EXISTS printer_port INT DEFAULT 9100;

-- 2. production_center_id nos itens (snapshot histórico)
ALTER TABLE pdv_order_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES pdv_production_centers(id);
ALTER TABLE pdv_comanda_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES pdv_production_centers(id);
ALTER TABLE delivery_order_items
  ADD COLUMN IF NOT EXISTS production_center_id UUID REFERENCES pdv_production_centers(id);

-- 3. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pdv_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE pdv_comanda_items;

-- 4. Views do Print Bridge (duas, uma por fluxo)
CREATE OR REPLACE VIEW vw_print_bridge_order_items AS
SELECT oi.id, oi.order_id, oi.production_center_id, oi.product_name,
       oi.quantity, oi.notes, oi.modifiers, oi.kitchen_status, oi.sent_to_kitchen_at,
       pc.name AS center_name, pc.printer_ip, pc.printer_port,
       o.order_number, o.table_id, t.name AS table_name, o.customer_name, o.source,
       o.user_id AS tenant_user_id
FROM pdv_order_items oi
JOIN pdv_orders o ON o.id = oi.order_id
LEFT JOIN pdv_production_centers pc ON pc.id = oi.production_center_id
LEFT JOIN pdv_tables t ON t.id = o.table_id;

CREATE OR REPLACE VIEW vw_print_bridge_comanda_items AS
SELECT ci.id, ci.comanda_id, ci.production_center_id, ci.product_name,
       ci.quantity, ci.notes, ci.modifiers, ci.kitchen_status, ci.sent_to_kitchen_at,
       pc.name AS center_name, pc.printer_ip, pc.printer_port,
       c.comanda_number, c.customer_name, c.user_id AS tenant_user_id
FROM pdv_comanda_items ci
JOIN pdv_comandas c ON c.id = ci.comanda_id
LEFT JOIN pdv_production_centers pc ON pc.id = ci.production_center_id;
```

## PARTE 2 — Frontend: preencher `production_center_id` ao lançar

**Novo:** `src/utils/resolveProductionCenter.ts`
```ts
// Resolve o centro a partir do produto (via slug printer_station)
export async function resolveProductionCenterId(productId, ownerUserId) {
  const { data: product } = await supabase.from('pdv_products')
    .select('printer_station').eq('id', productId).single();
  if (!product?.printer_station) return null;
  const { data: center } = await supabase.from('pdv_production_centers')
    .select('id').eq('user_id', ownerUserId).eq('slug', product.printer_station)
    .eq('is_active', true).maybeSingle();
  return center?.id ?? null;
}
```

**Editado** — incluir `production_center_id` antes do INSERT em:
- `src/hooks/use-pdv-orders.ts` (mutation `addItem`)
- `src/hooks/use-pdv-comandas.ts` (mutation `addItem`)
- qualquer fluxo de delivery que insere em `delivery_order_items` (verificar `src/hooks/use-delivery-orders*` se existir)

## PARTE 3 — Print Bridge (`/print-bridge/`)

Arquivos a criar na raiz do repo (não fazem parte do build da app):

- `print-bridge/package.json` — `@supabase/supabase-js`, `dotenv`
- `print-bridge/.env.example` — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ESTABLISHMENT_NAME`, `BRIDGE_HTTP_PORT=7777`
- `print-bridge/server.js` — responsabilidades:
  1. Subscribe Realtime em `pdv_order_items` e `pdv_comanda_items` (INSERT), canal único por tentativa (`print-bridge-${Date.now()}`), backoff exponencial 30s → 5min em `CHANNEL_ERROR`/`CLOSED`, `removeChannel` antes de reconectar.
  2. Ao receber evento, buscar linha completa na view correspondente por `id`.
  3. Se `printer_ip` vazio → log warning e ignora.
  4. Dedup via `Set<string>` de IDs já processados (protege contra replay).
  5. Impressão TCP (`net.Socket`, timeout 5s, porta `printer_port`) com sequência ESC/POS exata do spec:
     - ESC @ → ESC a 1 → GS ! 0x11 → estabelecimento → ESC a 0 → GS ! 0x00 → separador → centro/mesa/pedido/datetime → separador → itens (GS ! 0x01 em maiúsculas, `OBS:` indentado, modifiers indentados) → separador → 4×LF → GS V A 0x05 (corte parcial).
  6. Mini HTTP server local (`http.createServer`) em `BRIDGE_HTTP_PORT` expondo:
     - `POST /test-print` body `{ ip, port? }` → dispara impressão de teste, retorna `{ ok, error? }`
     - `GET /health` → `{ status: "ok" }`
     - CORS aberto para `*` (é localhost do próprio caixa).
  7. Logs com timestamp no formato pedido.

- `print-bridge/test-print.js` — CLI: `node test-print.js <IP> [port]`, envia ESC/POS de teste e imprime resultado.
- `print-bridge/README.md` — instalação (Node 18+, `npm install`, `.env`), execução manual, autostart com pm2, troubleshooting.

## PARTE 4 — Tela `/pdv/centros-producao`

**Editar `ProductionCenterDialog.tsx`**
- Renomear campo “Impressora” para dois campos: **IP da impressora** (`printer_ip`) e **Porta** (`printer_port`, default 9100).
- Mantém `printer_name` como rótulo amigável (opcional).

**Editar `ProductionCentersTab.tsx`** (o card já redesenhado)
- No card: mostrar `printer_ip:printer_port` em vez de `printer_name`.
- Bolinha de status (verde/vermelho/cinza) à esquerda do IP, lida de `localStorage[`printer-status-${center.id}`]` (`{ ok, at }`).
- Botão/Menu-item **“Testar impressora”** → `fetch('http://localhost:7777/test-print', { method:'POST', body: JSON.stringify({ ip, port }) })`.
  - Sucesso → toast verde, grava status OK no localStorage.
  - Erro de rede → toast “Print Bridge offline — inicie o serviço no PC do caixa”.
  - Erro do bridge → toast vermelho com mensagem, grava status falho.

**Atualizar `use-production-centers.ts`** — incluir `printer_ip` e `printer_port` na interface e nos payloads de create/update.

## PARTE 5 — Feedback no tablet do garçom

Em `GarcomComandaDetalhe.tsx` (e onde mais `sendToKitchen` é chamado):
- Antes do envio, contar itens pendentes sem `production_center_id`.
- Chamar `sendToKitchen(pendingIds)` normalmente (não bloquear).
- Após sucesso: `toast.success("Comanda enviada para a cozinha")`.
- Se `missingCount > 0`: `toast.warning("⚠ ${missingCount} produto(s) sem centro de produção — verifique o cadastro")`.

---

## Resumo de arquivos

**SQL (migração):** colunas IP/porta, 3×`production_center_id`, publication realtime, 2 views.

**Novos arquivos:**
- `src/utils/resolveProductionCenter.ts`
- `print-bridge/package.json`
- `print-bridge/.env.example`
- `print-bridge/server.js`
- `print-bridge/test-print.js`
- `print-bridge/README.md`

**Arquivos editados:**
- `src/hooks/use-pdv-orders.ts` (addItem → resolve + grava production_center_id)
- `src/hooks/use-pdv-comandas.ts` (addItem idem)
- `src/hooks/use-production-centers.ts` (campos printer_ip/printer_port)
- `src/components/pdv/settings/ProductionCenterDialog.tsx` (campos IP/porta)
- `src/components/pdv/settings/ProductionCentersTab.tsx` (status dot + botão testar)
- `src/pages/garcom/GarcomComandaDetalhe.tsx` (toasts + aviso)
- `src/pages/pdv/Kitchen.tsx` e `use-pdv-kitchen.ts` (opcional: usar `production_center_id` quando presente, mantendo fallback atual para não quebrar dados antigos)

**Dependências:** nenhuma nova no app React. No bridge apenas `@supabase/supabase-js` e `dotenv`.

**Sim — conseguimos implementar tudo.** As únicas divergências do spec são as 4 correções listadas no topo (IP/porta, slug→id, HTTP local em vez de /api Next, duas views). Posso prosseguir?
