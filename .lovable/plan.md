

## Fix: Relatório WhatsApp não envia — número sem código de país

### Diagnóstico
Os logs mostram claramente o problema:
```
Evolution API error: {"jid":"54996535731@s.whatsapp.net","exists":false,"number":"54996535731"}
```

O número salvo no banco é `(54) 99653-5731`. Após limpar caracteres não numéricos fica `54996535731` (11 dígitos, DDD 54 + celular). A Evolution API precisa do número com DDI `55` na frente: `5554996535731`.

O fix anterior adicionou o prefixo `55`, mas a edge function pode não ter sido re-deployada. Além disso, a Evolution API retorna `exists: false` porque ela valida se o número existe no WhatsApp antes de enviar — precisamos tratar esse caso com mensagem de erro clara.

### Mudanças

**Arquivo: `supabase/functions/send-tasks-report/index.ts`**

1. Garantir normalização correta do telefone: strip non-digits, prefixar `55` se necessário
2. Adicionar log do número final antes do envio (para debug)
3. Melhorar mensagem de erro quando Evolution retorna `exists: false` — informar que o número não foi encontrado no WhatsApp
4. Forçar re-deploy da function

A correção é simples e focada: garantir que o número chegue como `5554996535731` na API e tratar o erro `exists: false` com mensagem amigável.

