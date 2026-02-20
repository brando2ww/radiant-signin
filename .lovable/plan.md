
## Correção: Número de Telefone sem Código do País

### Causa Raiz

Na edge function `send-quotation-whatsapp/index.ts`, o telefone é formatado assim:

```typescript
const formattedPhone = phone.replace(/\D/g, '')
// "(54) 99223-2827" → "5499223-2827" → "54992232827"  ❌
```

A Evolution API exige o formato internacional completo com código do país:
```
5554992232827  ✅  (55 + DDD + número)
```

Já existe a função `formatPhoneForWhatsApp` em `src/lib/whatsapp-message.ts` que adiciona `55` quando necessário, mas a edge function não pode importar código do frontend — ela precisa ter essa lógica inline.

### Solução

Adicionar lógica de prefixo `55` na edge function, após remover os caracteres não numéricos:

```typescript
let formattedPhone = phone.replace(/\D/g, '')

// Garantir código do Brasil (55)
if (!formattedPhone.startsWith('55')) {
  formattedPhone = '55' + formattedPhone
}
// "(54) 99223-2827" → "54992232827" → "5554992232827" ✅
```

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-quotation-whatsapp/index.ts` | Adicionar prefixo `55` ao número antes de enviar para a Evolution API |

### Comportamento Esperado Após a Correção

| Entrada | Antes (errado) | Depois (correto) |
|---------|---------------|-----------------|
| `(54) 99223-2827` | `54992232827` | `5554992232827` |
| `11987654321` | `11987654321` | `5511987654321` |
| `5511987654321` | `5511987654321` | `5511987654321` (sem duplicar) |
