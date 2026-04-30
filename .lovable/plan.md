## Diagnóstico

Não há erros de servidor nos logs do Postgres/Edge — as RLS de `checklist_execution_items` e do bucket `checklist-evidence` estão liberadas corretamente. O problema está no fluxo de cliente em `ExecutionItemRenderer.tsx` e na lógica de "obrigatório" em `ChecklistExecutionPage.tsx`:

1. **Erros de upload silenciosos** — em `handlePhoto`, se `supabase.storage.upload(...)` falha (ex.: arquivo grande, MIME bloqueado, conflito de path), o `error` é ignorado: nenhum toast é exibido e `onSave` nunca é chamado, então o item nunca recebe `completed_at`. O usuário vê o botão travado em "Faltam X obrigatórios" sem entender o motivo.
2. **`remove` antes de `upload` quebra o `upsert`** — o código faz `remove([path])` e depois `upload(..., { upsert: true })`. O `remove` retorna erro silencioso quando o arquivo não existe, e em alguns casos o `upload` falha por race / cache. O `upsert: true` já cobre substituição, então o `remove` é desnecessário e prejudicial.
3. **Item tipo `photo` depende só do upload para virar "concluído"** — se o upload falhar (mesmo silenciosamente), o item permanece pendente para sempre. Não há retry nem feedback.
4. **`requires_photo` não é validado na conclusão** — itens não-foto com `requires_photo=true` podem ser marcados como concluídos sem foto, mas isso é bug separado (não bloqueia, então fora do escopo desta correção).
5. **Estado local desatualizado** — `setData` em `handleSave` usa `data?.items?.find` no callback, mas o `data` do closure pode estar defasado se vários saves dispararem em sequência.

## Correções

### 1. `src/components/pdv/checklists/execution/ExecutionItemRenderer.tsx`
- Remover a chamada `storage.remove([path])` antes do upload.
- Tratar `error` do upload exibindo um `toast` (sonner) com a mensagem de erro real.
- Logar `error` no console para diagnóstico futuro.
- Garantir `setUploading(false)` num `try/finally`.
- Limpar o `value` do `<input type="file">` após o upload para permitir reenvio do mesmo arquivo.

### 2. `src/components/pdv/checklists/execution/ChecklistExecutionPage.tsx`
- Em `handleComplete`, antes de chamar `completeExecution`, revalidar contra o servidor (refetch `loadExecution`) para evitar concluir com base em estado local desatualizado.
- Caso ainda existam obrigatórios incompletos depois do refetch, exibir toast listando os títulos pendentes em vez de só desabilitar o botão silenciosamente.
- Passar a usar a forma funcional de `setData((prev) => ...)` no `handleSave` para evitar leitura defasada.

### 3. (Opcional, robustez) `src/hooks/use-checklist-execution.ts`
- Em `saveItemValue`, retornar o `error` da resposta do `update` e propagar via throw para o caller, permitindo que o `ExecutionItemRenderer` mostre erro caso a gravação do `photo_url` no banco falhe (ex.: RLS).

## Resultado esperado

- Usuário vê toast explicando qualquer falha de upload em vez de o botão "Concluir" ficar travado sem feedback.
- Itens de foto que subiram corretamente passam a contar como concluídos imediatamente.
- Conclusão revalida contra o servidor, eliminando falsos negativos por estado local.
