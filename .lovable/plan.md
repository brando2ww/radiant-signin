## Problema

Na tela do Salão (e Comandas), ao abrir uma comanda ocupada o diálogo mostra "Nenhum item na comanda", mesmo quando o total exibido é maior que zero (ex.: R$ 1.267,50). Confirmei no banco: a comanda `20260429-005` tem 29 itens (19 visíveis + 10 filhos de composição) somando R$ 1.267,50. Os dados existem; o problema é no frontend.

## Causa raiz

No hook `src/hooks/use-pdv-comandas.ts`:

- A query de comandas usa `visibleUserId` (dono do estabelecimento) na chave e no filtro.
- A query de itens usa `user?.id` (usuário logado, que para um funcionário é diferente do dono) na `queryKey`, e tem `enabled: !!user && comandas.length > 0`.
- A `queryKey` dos itens não depende de `comandas` nem de `visibleUserId`. Resultado: dependendo da ordem em que `comandas` e `visibleUserId` ficam prontos (ou quando o staff troca de contexto), a query de itens pode:
  1. Iniciar com `comandas.length === 0` (desabilitada) e nunca re-executar de forma confiável quando `comandas` chega — mantendo cache vazio do mount anterior.
  2. Ficar com cache "preso" porque a chave nunca muda quando novas comandas são criadas/abertas.

Por isso o usuário vê o total calculado pelo trigger no banco (`update_comanda_subtotal` atualiza `subtotal` mesmo quando o front não tem itens carregados), mas a lista no diálogo fica vazia.

Adicionalmente, o filtro `getItemsByComanda` esconde itens com `is_composite_child = true` (correto), porém não é a causa — há 19 itens com `is_composite_child = false` que deveriam aparecer.

## Plano de correção

### 1. Corrigir a query de itens em `src/hooks/use-pdv-comandas.ts`

- Trocar `user?.id` por `visibleUserId` na `queryKey` (alinhar com a query de comandas).
- Incluir as IDs das comandas (ou ao menos `comandas.length` + último `updated_at`) na `queryKey` para que toda nova comanda dispare refetch automático.
- Manter `enabled: !!visibleUserId && comandas.length > 0`.

Estrutura final (resumo):

```ts
const comandaIds = comandas.map((c) => c.id);
const { data: comandaItems = [] } = useQuery({
  queryKey: ["pdv-comanda-items", visibleUserId, comandaIds.join(",")],
  queryFn: async () => {
    if (!visibleUserId || comandaIds.length === 0) return [];
    const { data, error } = await supabase
      .from("pdv_comanda_items")
      .select("*")
      .in("comanda_id", comandaIds)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as ComandaItem[];
  },
  enabled: !!visibleUserId && comandaIds.length > 0,
});
```

### 2. Garantir invalidação consistente

Revisar os pontos do hook que fazem `queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items", ...] })` e ajustar para invalidar pela raiz `["pdv-comanda-items"]` (sem o segundo segmento), evitando que mudanças no formato da chave deixem invalidações órfãs.

### 3. Validação manual após a correção

- Abrir Salão → mesa ocupada → clicar em uma comanda. A lista de itens deve aparecer com os 19 itens visíveis e o total R$ 1.267,50 deve continuar igual.
- Adicionar item novo via "Adicionar item" e confirmar que ele aparece imediatamente (refetch).
- Repetir o teste logado como funcionário (não-dono) para validar que o `visibleUserId` resolve corretamente.

## Arquivos afetados

- `src/hooks/use-pdv-comandas.ts` (ajuste da query e das invalidações).

Sem migrações de banco e sem mudanças de UI.
