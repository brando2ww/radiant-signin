

## Garantir que a mesa fique "ocupada" assim que o garçom abrir uma comanda

### Diagnóstico

O fluxo de abrir comanda já marca a mesa como `ocupada` no banco (ver `GarcomMesaDetalhe.tsx` → `handleNewComanda`). Mas a tela `/garcom` (grid de mesas) só atualiza visualmente após o `invalidateQueries` recarregar a lista do servidor — e existem dois pontos que atrasam ou impedem essa atualização:

1. **Cache key errado no update otimista** — em `usePDVTables.updateTable` o `onMutate`/`onError` usa `["pdv-tables", user?.id]`, mas a query é montada com `["pdv-tables", visibleUserId]`. Para garçons, `visibleUserId` é o id do dono do estabelecimento (não o do garçom). Resultado: o update otimista escreve numa chave que ninguém lê, e a mesa só "vira vermelha" depois do refetch.
2. **Sem realtime / sem refetch ao voltar** — quando o garçom volta da tela de comanda para a grid, não há `refetch` automático. Se o invalidate chegou antes da navegação, ok; se não, a mesa aparece "Livre" por alguns segundos.
3. **Sem garantia de consistência ao adicionar item** — se a comanda foi aberta em outra sessão (outro garçom, ou via PDV), e o `pdv_orders` existe mas a mesa ficou `livre` por algum motivo, adicionar item não corrige o status.

### Solução

**1. Corrigir cache key do update otimista** (`src/hooks/use-pdv-tables.ts`)

Trocar todas as referências `["pdv-tables", user?.id]` por `["pdv-tables", visibleUserId]` dentro de `updateTable`. Assim a UI muda na hora, sem esperar o servidor.

**2. Refetch ao focar a tela de mesas** (`src/pages/garcom/GarcomMesas.tsx`)

Adicionar `refetchOnWindowFocus: true` e `refetchOnMount: "always"` ao `useQuery` em `usePDVTables` (ou disparar `queryClient.invalidateQueries(["pdv-tables"])` no `useEffect` do `GarcomMesas`). Garante que ao voltar da comanda a grid já está fresca.

**3. Garantir status ao criar comanda mesmo com order pré-existente** (`src/pages/garcom/GarcomMesaDetalhe.tsx`)

Hoje o `handleNewComanda` só seta `status: "ocupada"` quando cria um novo `pdv_order`. Mover o `updateTable({ status: "ocupada" })` para fora do `if (!orderId)` — sempre que uma comanda for aberta na mesa, força o status, mesmo que o `current_order_id` já existisse.

**4. Limpeza opcional de mesas "ocupadas" sem comanda aberta**

A query mostra mesas como "Mesa 22" e "a3" marcadas como `ocupada` com 0 comandas abertas — resíduo dos bugs anteriores. Migration curta para normalizar:

```sql
UPDATE pdv_tables t
SET status = 'livre', current_order_id = NULL
WHERE is_active = true
  AND status <> 'livre'
  AND NOT EXISTS (
    SELECT 1 FROM pdv_comandas c
    WHERE c.order_id = t.current_order_id AND c.status = 'aberta'
  );
```

### Validação

1. Logar como garçom em `/garcom`. Mesa X aparece verde (Livre).
2. Tocar na Mesa X → "Abrir Comanda" → adicionar item.
3. Voltar para `/garcom` → Mesa X aparece **vermelha (Ocupada) imediatamente**, sem precisar puxar para atualizar.
4. Outras mesas livres continuam verdes.
5. Conferir banco: `pdv_tables.status = 'ocupada'` e `current_order_id` preenchido.

### Fora de escopo

- Realtime via Supabase channels (atualização cross-device). Pode ser feito depois se houver caso de múltiplos garçons no mesmo salão.
- Mudar a paleta de cores das mesas.

