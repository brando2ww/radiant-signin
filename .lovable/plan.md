
## Problema Identificado

A função `sendWhatsAppMessage` (linha 890) usa **sempre** a variável de ambiente `evolutionInstanceName` para enviar mensagens:

```typescript
// LINHA 894 - PROBLEMA
const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstanceName}`, {
```

`evolutionInstanceName` é a instância do agente pessoal (Eduardo Brando / +55 54 99166-3821). Quando o fornecedor CARLOS responde na `LOJA 2`, o sistema processa corretamente, salva a cotação, mas ao enviar a confirmação "✅ Obrigado pela cotação!" usa a instância errada — enviando pelo número pessoal em vez do número da loja.

---

## Solução

### Mudança 1 — Adicionar parâmetro `instanceName` na função `sendWhatsAppMessage`

```typescript
// ANTES:
async function sendWhatsAppMessage(remoteJid: string, message: string)

// DEPOIS:
async function sendWhatsAppMessage(remoteJid: string, message: string, instanceName?: string)
```

Internamente, usar o `instanceName` recebido, ou `evolutionInstanceName` como fallback (para o agente pessoal):

```typescript
const targetInstance = instanceName || evolutionInstanceName;
const response = await fetch(`${evolutionApiUrl}/message/sendText/${encodeURIComponent(targetInstance)}`, {
```

### Mudança 2 — Passar o `instanceName` em `processMessage`

A função `processMessage` já recebe o `instanceName` e já resolve o `resolvedUserId`. Basta passar o `instanceName` para todas as chamadas de `sendWhatsAppMessage` dentro do fluxo de cotação (linhas 1319-1327):

```typescript
// Envio da confirmação da cotação — usando a instância da loja
await sendWhatsAppMessage(
  remoteJid,
  `✅ Obrigado pela cotação!...`,
  instanceName  // ← passa a instância da loja (ex: "LOJA 2")
);
```

### Mudança 3 — Manter o agente pessoal inalterado

Todas as outras chamadas `sendWhatsAppMessage` (agente Velara, agenda, finanças) continuam sem o parâmetro, usando `evolutionInstanceName` como fallback. Isso garante que o agente pessoal funcione normalmente.

---

## Arquivo a Modificar

| Arquivo | Linhas alteradas |
|---------|-----------------|
| `supabase/functions/whatsapp-transactions/index.ts` | Linha 890: assinatura da função + linha 894: usar instância dinâmica; Linhas 1319-1327: passar `instanceName` nas confirmações de cotação |

---

## Fluxo Correto Após a Correção

```text
Fornecedor CARLOS responde na LOJA 2
  → processMessage(remoteJid, texto, "LOJA 2")
  → findSupplierByPhone → CARLOS encontrado ✅
  → IA extrai preços e salva cotação ✅
  → sendWhatsAppMessage(remoteJid, confirmação, "LOJA 2")  ← instância correta!
  → Mensagem de confirmação sai pelo número da LOJA 2 (Eduardo Brando) ✅
  → NÃO usa +55 54 99166-3821 ✅
```
