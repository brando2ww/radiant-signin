
## Problema: Múltiplas Lojas — Rastreamento de Instância Incorreto

Com múltiplas lojas conectadas via WhatsApp, existem 3 falhas encadeadas que precisam ser corrigidas:

---

### Falha 1: Coluna errada no JOIN (bug crítico)

Na função `findPendingQuotationsForSupplier`, o Supabase está tentando fazer join usando uma coluna chamada `quotation_id` dentro de `pdv_quotation_items`, mas o nome real no banco é `quotation_request_id`.

Resultado: o join retorna `quotation: null` em todos os registros → nenhuma cotação pendente é encontrada → a IA nunca é acionada.

---

### Falha 2: Webhook não sabe de qual loja a mensagem veio

Quando a Evolution API chama o webhook, o payload inclui o campo `instance` com o nome da instância que recebeu a mensagem:

```json
{
  "event": "messages.upsert",
  "instance": "LOJA 2",
  "data": { "key": { "remoteJid": "5554..." }, ... }
}
```

O código atual **ignora** esse campo `instance`. Quando um fornecedor responde, o sistema não sabe que aquela resposta veio da "LOJA 2" — e com múltiplas lojas, pode confundir fornecedores de lojas diferentes que tenham números parecidos.

---

### Falha 3: Webhook não configurado automaticamente para novas instâncias

Quando o usuário conecta uma nova loja pelo painel, o webhook não é registrado automaticamente na Evolution API para aquela instância. É preciso configurar manualmente — o que é inviável com muitas lojas.

---

### Solução Completa

#### Parte 1 — Corrigir o nome da coluna (1 linha)

Arquivo: `supabase/functions/whatsapp-transactions/index.ts`

```typescript
// ANTES (errado):
quotation_item:pdv_quotation_items(
  id,
  quotation_id,   ← não existe
  ...

// DEPOIS (correto):
quotation_item:pdv_quotation_items(
  id,
  quotation_request_id,   ← nome real no banco
  ...
```

#### Parte 2 — Usar `instance` do webhook para rastrear a loja correta

No corpo do webhook recebido, extrair `body.instance` (nome da instância Evolution API). Com esse nome, buscar qual `user_id` é dono daquela instância na tabela `whatsapp_connections`:

```typescript
// No handler do webhook:
const instanceName = body.instance  // ex: "LOJA 2"

// Buscar o dono dessa instância:
const { data: connection } = await supabase
  .from('whatsapp_connections')
  .select('user_id')
  .eq('instance_name', instanceName)
  .maybeSingle()

// Passar userId para findPendingQuotationsForSupplier — 
// garantindo que só buscamos cotações DAQUELA loja específica
```

Isso garante que:
- Resposta recebida na "LOJA 2" → busca só cotações do dono da "LOJA 2"
- Resposta recebida na "VELARA MEI" → busca só cotações do dono da "VELARA MEI"
- Fornecedores com números parecidos entre lojas diferentes não se cruzam

A função `processMessage` também precisa receber o `userId` como parâmetro para repassar a todas as sub-funções de cotação.

#### Parte 3 — Registrar webhook automaticamente ao enviar cotação

No `send-quotation-whatsapp`, após enviar com sucesso, chamar a Evolution API para registrar o webhook da instância usada, caso ainda não esteja configurado:

```typescript
// Depois de enviar mensagens:
await fetch(`${evolutionApiUrl}/webhook/set/${instanceName}`, {
  method: 'POST',
  headers: { 'apikey': evolutionApiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: `${supabaseUrl}/functions/v1/whatsapp-transactions`,
    events: ['messages.upsert'],
    enabled: true,
    webhookByEvents: false,
  })
})
```

Isso garante que toda loja que enviar uma cotação automaticamente passa a receber as respostas.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/whatsapp-transactions/index.ts` | (1) Corrigir `quotation_id` → `quotation_request_id`; (2) Extrair `instance` do payload e resolver `user_id` via `whatsapp_connections`; (3) Passar `userId` para `processMessage` e `findPendingQuotationsForSupplier` |
| `supabase/functions/send-quotation-whatsapp/index.ts` | (3) Após envio bem-sucedido, registrar webhook da instância usada na Evolution API |

---

### Fluxo Final (com múltiplas lojas)

```text
Loja A envia cotação via WhatsApp (instância "LOJA A")
  → send-quotation-whatsapp registra webhook da "LOJA A"

Loja B envia cotação via WhatsApp (instância "LOJA B")
  → send-quotation-whatsapp registra webhook da "LOJA B"

Fornecedor responde para "LOJA A"
  → webhook chega com body.instance = "LOJA A"
  → sistema resolve user_id do dono da "LOJA A"
  → busca cotações APENAS do user_id correto
  → IA extrai preços → salva resposta → confirma ao fornecedor ✅

Fornecedor responde para "LOJA B"
  → webhook chega com body.instance = "LOJA B"
  → sistema resolve user_id do dono da "LOJA B"
  → sem cruzamento entre lojas ✅
```
