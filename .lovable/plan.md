

## Fix: "Enviar Relatório" trava sem feedback — Evolution API timeout

### Diagnóstico
Os logs da edge function mostram `Sending report to phone: 5554996535731` mas **nunca** mostram `Evolution API response:`. O `fetch()` para a Evolution API está travando (provavelmente o mesmo problema de DNS que afetou o `whatsapp-qrcode` antes). A function faz timeout de ~60s sem retornar nada, e o frontend fica esperando eternamente sem mostrar toast.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `supabase/functions/send-tasks-report/index.ts` | Adicionar timeout no fetch + try/catch ao redor da chamada Evolution + log de erro |
| `src/pages/pdv/Tasks.tsx` | Adicionar timeout no lado do cliente para não esperar eternamente |

### Detalhes técnicos

**1. Edge function — timeout no fetch (send-tasks-report/index.ts)**

Envolver o `fetch` para Evolution API com `AbortController` de 15 segundos:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);

try {
  const evoResponse = await fetch(`${evoUrl}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: evoKey },
    body: JSON.stringify({ number: phone, text: message }),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  // ... rest of response handling
} catch (fetchErr: any) {
  clearTimeout(timeout);
  console.error("Evolution API fetch error:", fetchErr.message);
  if (fetchErr.name === "AbortError") {
    throw new Error("Timeout ao conectar com Evolution API. Verifique se o servidor está acessível.");
  }
  throw new Error(`Erro ao conectar com Evolution API: ${fetchErr.message}`);
}
```

Também logar a URL completa antes do fetch para confirmar que está correta.

**2. Frontend — timeout de segurança (Tasks.tsx)**

Adicionar um timeout de 20s no `handleSendReport` para garantir que o botão volte ao estado normal e o toast de erro apareça mesmo se a function travar:

```typescript
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error("Tempo esgotado. Tente novamente.")), 20000)
);
const result = await Promise.race([
  supabase.functions.invoke("send-tasks-report", { body: { user_id: user.id } }),
  timeoutPromise,
]);
```

### Resultado esperado
- Se Evolution API estiver OK: relatório enviado + toast de sucesso
- Se Evolution API travar: após 15s, toast de erro claro
- Se edge function travar: após 20s, toast de erro no frontend
- O botão sempre volta ao estado normal (não fica travado)

