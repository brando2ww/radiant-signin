
## Plano: Enviar Mensagens via Evolution API (Sem Abrir WhatsApp Web)

### Problema Atual

O botão "Abrir WhatsApp" usa `window.open()` para abrir o WhatsApp Web no navegador para cada fornecedor — exigindo que o usuário clique "Enviar" manualmente em cada aba. Isso é ineficiente.

### Solução

Substituir a abertura do WhatsApp Web por envio direto das mensagens via Evolution API, usando a instância WhatsApp já conectada do usuário. O botão passará a chamar uma Edge Function que envia as mensagens automaticamente para todos os fornecedores selecionados.

---

### Fluxo da Solução

```text
[WhatsAppSendDialog]
    ↓ clica "Enviar"
[Edge Function: send-quotation-whatsapp]
    ↓ busca instância do usuário em whatsapp_connections
    ↓ para cada fornecedor selecionado:
        POST /message/sendText/{instanceName}
        body: { number: phone, text: message }
    ↓ atualiza sent_at na tabela pdv_quotation_item_suppliers
    ↓ retorna { success, sent: N, errors: [] }
[Dialog fecha / toast de sucesso]
```

---

### Alterações Técnicas

#### 1. Nova Edge Function: `send-quotation-whatsapp`

Arquivo: `supabase/functions/send-quotation-whatsapp/index.ts`

Responsabilidades:
- Receber lista de fornecedores com telefone e mensagem
- Buscar a instância WhatsApp conectada do usuário em `whatsapp_connections`
- Enviar mensagem para cada fornecedor via `POST /message/sendText/{instanceName}`
- Atualizar `sent_at` nos registros de `pdv_quotation_item_suppliers`
- Retornar resultado detalhado (quantos enviados, erros)

Payload de entrada:
```json
{
  "quotationId": "uuid",
  "suppliers": [
    {
      "supplierId": "uuid",
      "phone": "5554999999999",
      "message": "Olá! Estamos solicitando cotação..."
    }
  ],
  "itemIds": ["uuid1", "uuid2"]
}
```

Usa os secrets já configurados: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

#### 2. Modificar `WhatsAppSendDialog.tsx`

- Remover imports de `openWhatsApp` e `generateQuotationMessage` (ou manter generateQuotationMessage)
- Adicionar estado `isSending` para feedback visual
- Substituir a lógica `handleSend` por uma chamada à nova edge function via `supabase.functions.invoke()`
- Alterar o botão:
  - Texto: "Enviar via WhatsApp (N)" ao invés de "Abrir WhatsApp (N)"
  - Adicionar estado de loading com spinner
  - Mostrar toast de sucesso/erro após envio
- Remover a nota de dica sobre "você precisará clicar em Enviar para cada um"

#### 3. Verificação da Conexão WhatsApp

A edge function verifica se o usuário tem uma conexão WhatsApp com `connection_status = 'open'`. Se não tiver, retorna erro 400 com mensagem explicativa para o usuário conectar o WhatsApp nas configurações.

---

### Exemplo do Envio (Evolution API)

Seguindo o padrão já usado em `send-whatsapp-code/index.ts`:

```typescript
const response = await fetch(
  `${evolutionApiUrl}/message/sendText/${instanceName}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey,
    },
    body: JSON.stringify({
      number: formattedPhone,  // ex: "5554999999999"
      text: message,
    }),
  }
);
```

---

### Arquivos a Modificar/Criar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-quotation-whatsapp/index.ts` | Criar nova edge function |
| `src/components/pdv/purchases/WhatsAppSendDialog.tsx` | Substituir lógica de abertura por chamada à edge function |

---

### Comportamento Final

- Usuário seleciona fornecedores e clica "Enviar via WhatsApp"
- Botão fica em loading enquanto envia
- Sistema envia mensagens automaticamente para todos os selecionados via Evolution API
- Toast: "X mensagens enviadas com sucesso!" ou detalhes de erro
- Dialog fecha após envio
- Se usuário não tiver WhatsApp conectado: toast de erro com link para configurações
