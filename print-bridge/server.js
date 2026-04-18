require("dotenv").config();
const net = require("net");
const http = require("http");
const { createClient } = require("@supabase/supabase-js");

const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  ESTABLISHMENT_NAME = "Estabelecimento",
  BRIDGE_HTTP_PORT = "7777",
} = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("✗ Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ─── Utilidades ──────────────────────────────────────────────────────────
const ts = () => new Date().toTimeString().slice(0, 8);
const log = (...args) => console.log(`[${ts()}]`, ...args);

const processedIds = new Set();
function markProcessed(id) {
  processedIds.add(id);
  // Limpa IDs antigos para não crescer sem limite
  if (processedIds.size > 5000) {
    const arr = [...processedIds];
    arr.slice(0, 2500).forEach((x) => processedIds.delete(x));
  }
}

// ─── ESC/POS ─────────────────────────────────────────────────────────────
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function buildReceipt({ header, body, centerName }) {
  const chunks = [];
  const push = (...bytes) => chunks.push(Buffer.from(bytes));
  const text = (s) => chunks.push(Buffer.from(s, "utf8"));
  const line = () => push(LF);

  // Init
  push(ESC, 0x40);
  // Center align
  push(ESC, 0x61, 0x01);
  // Double size
  push(GS, 0x21, 0x11);
  text(ESTABLISHMENT_NAME);
  line();
  // Left align + normal
  push(ESC, 0x61, 0x00);
  push(GS, 0x21, 0x00);
  text("================================");
  line();
  header.forEach((l) => {
    text(l);
    line();
  });
  text("================================");
  line();
  // Items (width 2x)
  body.forEach((item) => {
    push(GS, 0x21, 0x01);
    text(`${item.quantity}x ${String(item.product_name).toUpperCase()}`);
    line();
    push(GS, 0x21, 0x00);
    if (item.notes) {
      text(`  OBS: ${item.notes}`);
      line();
    }
    if (item.modifiers && typeof item.modifiers === "object") {
      const mods = Array.isArray(item.modifiers)
        ? item.modifiers
        : Object.values(item.modifiers);
      mods.flat().forEach((m) => {
        if (!m) return;
        const label = typeof m === "string" ? m : m.name || m.label || JSON.stringify(m);
        text(`  + ${label}`);
        line();
      });
    }
  });
  text("================================");
  line();
  if (centerName) {
    push(ESC, 0x61, 0x01);
    text(`>> ${centerName} <<`);
    line();
    push(ESC, 0x61, 0x00);
  }
  // Feed + partial cut
  push(LF, LF, LF, LF);
  push(GS, 0x56, 0x41, 0x05);

  return Buffer.concat(chunks);
}

function sendToPrinter(ip, port, payload) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (err) => {
      if (done) return;
      done = true;
      socket.destroy();
      err ? reject(err) : resolve();
    };
    socket.setTimeout(5000);
    socket.once("timeout", () => finish(new Error("Timeout de conexão (5s)")));
    socket.once("error", (err) => finish(err));
    socket.connect(port, ip, () => {
      socket.write(payload, (err) => {
        if (err) return finish(err);
        // pequeno delay para garantir flush
        setTimeout(() => finish(), 200);
      });
    });
  });
}

// ─── Formatação do cupom a partir de uma linha da view ───────────────────
function formatDateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handleOrderItem(itemId) {
  const { data, error } = await supabase
    .from("vw_print_bridge_order_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();
  if (error || !data) return;
  await printRow(data, "order");
}

async function handleComandaItem(itemId) {
  const { data, error } = await supabase
    .from("vw_print_bridge_comanda_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle();
  if (error || !data) return;
  await printRow(data, "comanda");
}

async function printRow(row, kind) {
  if (!row.printer_ip) {
    log(`⚠ Item ${row.id} sem printer_ip configurado (centro: ${row.center_name ?? "—"}). Ignorando.`);
    return;
  }
  const header = [
    `Centro: ${row.center_name ?? "—"}`,
    kind === "order"
      ? `Mesa: ${row.table_number ? `Mesa ${row.table_number}` : row.customer_name || "Balcão"}`
      : `Comanda: ${row.customer_name || row.comanda_number}`,
    kind === "order" ? `Pedido #${row.order_number}` : `Comanda #${row.comanda_number}`,
    formatDateTime(),
  ];
  if (row.is_composite_child && row.parent_product_name) {
    header.push(`+ Parte de: ${String(row.parent_product_name).toUpperCase()}`);
  }
  const payload = buildReceipt({
    header,
    body: [row],
    centerName: row.center_name,
  });
  const port = row.printer_port || 9100;
  log(
    `${kind === "order" ? "Pedido" : "Comanda"} ${row.order_number || row.comanda_number} — ${row.center_name} — 1 item → Imprimindo em ${row.printer_ip}:${port}`,
  );
  try {
    await sendToPrinter(row.printer_ip, port, payload);
    log(`✓ Impresso com sucesso (${row.printer_ip})`);
  } catch (err) {
    log(`✗ Erro ao imprimir em ${row.printer_ip}: ${err.message}`);
  }
}

// ─── Realtime com reconexão ──────────────────────────────────────────────
let currentChannel = null;
let reconnectDelay = 30000; // 30s base
const MAX_DELAY = 5 * 60 * 1000; // 5min

function scheduleReconnect() {
  log(`⟳ Reconectando em ${Math.round(reconnectDelay / 1000)}s...`);
  setTimeout(() => {
    reconnectDelay = Math.min(Math.round(reconnectDelay * 1.5), MAX_DELAY);
    connectRealtime();
  }, reconnectDelay);
}

function connectRealtime() {
  if (currentChannel) {
    supabase.removeChannel(currentChannel).catch(() => {});
    currentChannel = null;
  }
  const name = `print-bridge-${Date.now()}`;
  log(`→ Conectando Realtime (${name})...`);
  const channel = supabase
    .channel(name)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "pdv_order_items" },
      (payload) => {
        const id = payload?.new?.id;
        const sentAt = payload?.new?.sent_to_kitchen_at;
        if (!id || !sentAt || processedIds.has(id)) return;
        markProcessed(id);
        handleOrderItem(id).catch((e) => log(`✗ handleOrderItem: ${e.message}`));
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "pdv_order_items" },
      (payload) => {
        const id = payload?.new?.id;
        const oldSent = payload?.old?.sent_to_kitchen_at;
        const newSent = payload?.new?.sent_to_kitchen_at;
        // Só imprime na transição null → valor
        if (!id || oldSent || !newSent || processedIds.has(id)) return;
        markProcessed(id);
        handleOrderItem(id).catch((e) => log(`✗ handleOrderItem (update): ${e.message}`));
      },
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "pdv_comanda_items" },
      (payload) => {
        const id = payload?.new?.id;
        const sentAt = payload?.new?.sent_to_kitchen_at;
        if (!id || !sentAt || processedIds.has(id)) return;
        markProcessed(id);
        handleComandaItem(id).catch((e) => log(`✗ handleComandaItem: ${e.message}`));
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "pdv_comanda_items" },
      (payload) => {
        const id = payload?.new?.id;
        const oldSent = payload?.old?.sent_to_kitchen_at;
        const newSent = payload?.new?.sent_to_kitchen_at;
        if (!id || oldSent || !newSent || processedIds.has(id)) return;
        markProcessed(id);
        handleComandaItem(id).catch((e) => log(`✗ handleComandaItem (update): ${e.message}`));
      },
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        reconnectDelay = 30000;
        log(`✓ Realtime conectado. Ouvindo INSERTs em pdv_order_items e pdv_comanda_items.`);
      } else if (status === "CHANNEL_ERROR" || status === "CLOSED" || status === "TIMED_OUT") {
        log(`✗ Realtime ${status}${err ? `: ${err.message}` : ""}`);
        scheduleReconnect();
      }
    });
  currentChannel = channel;
}

// ─── HTTP server local (test-print / health) ─────────────────────────────
function startHttpServer() {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", establishment: ESTABLISHMENT_NAME }));
    }
    if (req.method === "POST" && req.url === "/test-print") {
      let buf = "";
      req.on("data", (chunk) => (buf += chunk));
      req.on("end", async () => {
        try {
          const { ip, port = 9100, centerName = "Teste" } = JSON.parse(buf || "{}");
          if (!ip) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ ok: false, error: "IP obrigatório" }));
          }
          const payload = buildReceipt({
            header: ["Centro: " + centerName, "*** TESTE DE IMPRESSÃO ***", formatDateTime()],
            body: [{ product_name: "Print Bridge OK", quantity: 1 }],
            centerName,
          });
          await sendToPrinter(ip, port, payload);
          log(`✓ Teste impresso em ${ip}:${port}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          log(`✗ Teste falhou: ${err.message}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(Number(BRIDGE_HTTP_PORT), "127.0.0.1", () => {
    log(`HTTP local em http://localhost:${BRIDGE_HTTP_PORT} (health, test-print)`);
  });
}

// ─── Boot ────────────────────────────────────────────────────────────────
log(`=== Velara Print Bridge — ${ESTABLISHMENT_NAME} ===`);
startHttpServer();
connectRealtime();

process.on("uncaughtException", (err) => log(`✗ uncaught: ${err.message}`));
process.on("unhandledRejection", (err) => log(`✗ unhandled: ${err}`));
