

## Fix: Botão "Enviar Relatório" sem feedback visível

### Problemas identificados

1. **Edge function não loga resposta de sucesso** — quando a Evolution API retorna 200, o corpo da resposta é lido mas nunca logado nem inspecionado. A Evolution pode retornar 200 com `exists: false` no body, e o código ignora isso.
2. **Frontend pode não mostrar toast** — o `handleSendReport` usa `toast()` do shadcn, que funciona mas o usuário relata não ver nada. Precisa de feedback mais óbvio.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `supabase/functions/send-tasks-report/index.ts` | Logar resposta da Evolution API mesmo em caso de sucesso; verificar `exists: false` também em respostas 200; re-deploy |
| `src/pages/pdv/Tasks.tsx` | Adicionar `console.log` para debug e garantir que o toast de erro/sucesso mostra a mensagem retornada pela function |

### Detalhes técnicos

**Edge function** — após `evoResponse.ok`:
```typescript
const responseBody = await evoResponse.text();
console.log("Evolution API response:", evoResponse.status, responseBody);

// Check for exists:false even on 200
try {
  const parsed = JSON.parse(responseBody);
  const msgs = parsed?.response?.message || (Array.isArray(parsed) ? parsed : [parsed]);
  if (msgs.some((m: any) => m.exists === false)) {
    throw new Error(`Número ${phone} não encontrado no WhatsApp`);
  }
} catch (parseErr: any) {
  if (parseErr.message.includes("não encontrado")) throw parseErr;
}
```

**Frontend** — melhorar feedback:
- Adicionar `console.log("Report response:", data, error)` no `handleSendReport` para debug
- Manter toast atual que já deveria funcionar — o log vai ajudar a identificar se o problema é no retorno da function

