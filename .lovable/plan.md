

## Corrigir tela após abrir mesa com múltiplas comandas

Após criar 2 comandas, o dialog "Abrir Mesa" reabre vazio em vez de mostrar a tela de gestão da mesa com as 2 comandas listadas.

### Causa

`tableComandas` é calculado por `comandas.filter(c => c.order_id === table.current_order_id)`. Após criar as comandas:

1. O `updateTable` que seta `current_order_id` na mesa é fire-and-forget — ainda não refletiu na query de tables quando a tela re-renderiza.
2. Enquanto `current_order_id` permanece `null`, o filtro retorna vazio, `hasOpenComandas` continua `false` e o dialog `showOpenDialog` reabre.
3. O `useEffect` de auto-redirect ainda pode disparar com `length === 1` se uma das comandas chegar no cache antes da outra, levando para uma comanda em vez da gestão da mesa.

### Mudanças em `src/pages/garcom/GarcomMesaDetalhe.tsx`

**1. Atualizar a mesa de forma síncrona (await direto no Supabase)**

Substituir o `updateTable` fire-and-forget por um update awaited:
```ts
await supabase.from("pdv_tables")
  .update({ status: "ocupada", current_order_id: orderId, updated_at: new Date().toISOString() })
  .eq("id", table.id);
```

**2. Refetch awaited das duas queries após criar comandas**
```ts
await Promise.all([
  queryClient.refetchQueries({ queryKey: ["pdv-tables"] }),
  queryClient.refetchQueries({ queryKey: ["pdv-comandas"] }),
]);
```
Só então `setOpening(false)`. Isso garante que quando o estado `opening` voltar a `false`, a tela já tem as comandas e o `current_order_id` da mesa atualizado, fechando o dialog naturalmente e renderizando a lista.

**3. Travar auto-redirect quando garçom criou múltiplas comandas**

Adicionar `const justCreatedMultipleRef = useRef(false);`. Setar `true` em `handleConfirmOpen` quando `names.length >= 2`. No `useEffect` de redirect (length === 1), retornar cedo se a ref for true — assim, mesmo se houver um intervalo onde apenas 1 comanda chegou no cache, não redireciona indevidamente.

### Comportamento final

- Mesa livre + 1 nome → cria 1 comanda → redireciona direto para `/garcom/comanda/{id}`.
- Mesa livre + 2+ nomes → cria N comandas → **fica na tela da mesa** mostrando 1 card por comanda, com nome e número.
- Tocar num card → abre `/garcom/comanda/{id}` para adicionar pedidos àquela comanda específica.
- Botão "+ Nova comanda" continua disponível para criar comandas adicionais.
- Voltar → volta para `/garcom`.

### Validação

- Adicionar "João" + "Maria" → tela mostra 2 cards "Comanda XXX-001 — João" e "Comanda XXX-002 — Maria", sem reabrir o dialog.
- Tocar em "João" → vai para a tela de pedidos da comanda do João.
- Voltar → continua mostrando as 2 comandas na mesa, ambas com os pedidos preservados.
- Mesa pré-existente com 1 comanda aberta → continua redirecionando direto (continuação de atendimento).

