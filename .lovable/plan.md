
## Correção: Payload do Webhook da Evolution API v2

### Causa Raiz Identificada

A Evolution API v2 mudou o formato do endpoint `/webhook/set/{instance}`. O payload precisa ter todos os campos aninhados dentro de uma propriedade `webhook`:

**Formato ERRADO (o que estamos enviando):**
```json
{
  "url": "https://...",
  "events": ["messages.upsert"],
  "enabled": true,
  "webhookByEvents": false
}
```

**Formato CORRETO (o que a API exige):**
```json
{
  "webhook": {
    "url": "https://...",
    "events": ["messages.upsert"],
    "enabled": true,
    "webhookByEvents": false
  }
}
```

O erro `"instance requires property \"webhook\""` é a própria API dizendo que está faltando essa propriedade raiz.

---

### Arquivos a Corrigir

O mesmo bug está em 3 lugares:

| Arquivo | Onde |
|---------|------|
| `supabase/functions/register-whatsapp-webhook/index.ts` | Linha 83 — payload do `fetch` de registro |
| `supabase/functions/send-quotation-whatsapp/index.ts` | Linha 157 — auto-registro após envio |
| `supabase/functions/whatsapp-transactions/index.ts` | Auto-registro de webhook que também existe lá |

---

### Mudança Técnica (igual nos 3 arquivos)

```typescript
// ANTES:
body: JSON.stringify({
  url: webhookUrl,
  events: ['messages.upsert'],
  enabled: true,
  webhookByEvents: false,
}),

// DEPOIS:
body: JSON.stringify({
  webhook: {
    url: webhookUrl,
    events: ['messages.upsert'],
    enabled: true,
    webhookByEvents: false,
  }
}),
```

---

### Após a Correção

1. Botão "Configurar Webhook" nas Configurações do WhatsApp vai funcionar e registrar a `LOJA 2`
2. O auto-registro ao abrir o diálogo de envio vai funcionar
3. A `LOJA 2` passará a receber e encaminhar mensagens para a edge function
4. A resposta do CARLOS será capturada automaticamente

Os 3 arquivos serão corrigidos e reimplantados simultaneamente.
