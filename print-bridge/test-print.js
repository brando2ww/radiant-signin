#!/usr/bin/env node
const net = require("net");

const ip = process.argv[2];
const port = Number(process.argv[3] || 9100);

if (!ip) {
  console.error("Uso: node test-print.js <IP> [porta=9100]");
  process.exit(1);
}

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function stripAccents(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const chunks = [];
const push = (...b) => chunks.push(Buffer.from(b));
const text = (s) => chunks.push(Buffer.from(stripAccents(s), "utf8"));

push(ESC, 0x40);
push(ESC, 0x61, 0x01);
push(GS, 0x21, 0x11);
text("*** VELARA PRINT BRIDGE ***");
push(LF);
push(GS, 0x21, 0x00);
text("Teste de conexão");
push(LF);
text(new Date().toLocaleString("pt-BR"));
push(LF, LF, LF, LF);
push(GS, 0x56, 0x41, 0x05);

const payload = Buffer.concat(chunks);
const socket = new net.Socket();
socket.setTimeout(5000);

socket.once("timeout", () => {
  console.error(`✗ Timeout ao conectar em ${ip}:${port}`);
  socket.destroy();
  process.exit(2);
});

socket.once("error", (err) => {
  console.error(`✗ Erro: ${err.message}`);
  process.exit(3);
});

socket.connect(port, ip, () => {
  socket.write(payload, (err) => {
    if (err) {
      console.error(`✗ Erro ao enviar: ${err.message}`);
      process.exit(4);
    }
    setTimeout(() => {
      console.log(`✓ Impressora ${ip}:${port} respondeu com sucesso`);
      socket.destroy();
      process.exit(0);
    }, 300);
  });
});
