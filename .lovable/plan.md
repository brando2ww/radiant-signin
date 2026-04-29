## Diagnóstico confirmado

Você está certo: “ter 1106 itens” não é da comanda atual, é o histórico inteiro da loja. O bug é que o hook de comandas está buscando itens de muitas comandas ao mesmo tempo e sofre corte por limite padrão de linhas, então a comanda aberta pode ficar sem itens no frontend.

Também confirmei que a comanda `20260429-005` tem itens reais no banco (não está vazia).

## Plano de correção (implementação)

### 1) Ajustar query de itens em `src/hooks/use-pdv-comandas.ts`

Trocar o carregamento de itens para considerar **somente comandas ativas** no contexto do salão:
- `aberta`
- `em_cobranca`
- `aguardando_pagamento`

Isso evita carregar histórico de comandas fechadas/canceladas e reduz drasticamente o volume.

### 2) Garantir segurança contra limite de linhas

Na mesma query de itens:
- manter filtro por `activeComandaIds`
- adicionar `limit(10000)` explícito para não depender do default
- manter ordenação por `created_at`

### 3) Atualizar chave de cache (queryKey)

A `queryKey` dos itens deve usar:
- `visibleUserId`
- hash/string dos IDs ativos

Assim toda alteração de comandas abertas dispara refetch correto.

### 4) Verificação manual após patch

No `/pdv/salao`:
1. abrir a Mesa 3
2. abrir comanda `#20260429-005`
3. validar que os itens aparecem
4. adicionar um item e confirmar atualização imediata da lista
5. fechar e reabrir modal para garantir consistência

## Arquivo impactado

- `src/hooks/use-pdv-comandas.ts`

Sem migration de banco.