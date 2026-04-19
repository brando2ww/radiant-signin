

## Plano: remover acentos antes de imprimir

Solução mais simples: normalizar o texto para ASCII no bridge antes de enviar para a impressora. Sem dependências novas, sem mexer em code page.

### Mudança em `print-bridge/server.js`

Adicionar função utilitária:
```js
function stripAccents(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
```

Trocar a função `text(s)` usada em `buildReceipt` para passar pelo `stripAccents` antes de gerar o Buffer UTF-8:
```js
const text = (s) => chunks.push(Buffer.from(stripAccents(s), "utf8"));
```

Aplicar a mesma normalização em qualquer campo do payload que vire texto impresso (product_name, notes, customer_name, comanda_number, center_name, parent_product_name).

### Mudança em `print-bridge/test-print.js`

Mesma função `stripAccents` + mesmo wrapper em `text()` para o teste refletir o comportamento real.

### Resultado

- "Água sem Gás" → `Agua sem Gas`
- "Sequência" → `Sequencia`
- "Ação" → `Acao`
- "Coração" → `Coracao`
- Cedilha (ç) e til (ã, õ) viram c/a/o
- Sem caracteres estranhos no papel

### Ação do usuário após deploy

1. Substituir `server.js` e `test-print.js` no PC do bridge
2. `pm2 restart velara-print-bridge`
3. Reenviar uma comanda de teste com acentos

### Arquivos

- `print-bridge/server.js` — adicionar `stripAccents` e aplicar em `text()`
- `print-bridge/test-print.js` — mesma normalização

