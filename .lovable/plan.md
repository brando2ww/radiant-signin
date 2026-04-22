

## Bug: item adicionado a uma mesa aparece em todas as outras mesas

### Diagnóstico

Quando o garçom abre uma comanda numa mesa "livre", a mesa não tem `current_order_id` (é `null`) e **nenhum `pdv_order` é criado**. A comanda é gravada com `order_id = null` (verificado no banco — todas as comandas-de-mesa estão com `order_id = NULL`).

O filtro em `GarcomMesaDetalhe.tsx` é:

```ts
comandas.filter(c => c.order_id === table?.current_order_id && c.status === "aberta")
```

Como `table.current_order_id` também é `null` para mesas livres, a comparação `null === null` é `true` para **todas** as mesas livres simultaneamente. Resultado: qualquer comanda avulsa (ou aberta em outra mesa) aparece em **todas** as mesas livres ao mesmo tempo, parecendo "replicada".

Comprovação no banco: o Negroni existe em apenas uma linha em `pdv_comanda_items` por comanda — não há duplicação real, é só efeito visual do filtro errado.

### Solução

Garantir que toda comanda aberta a partir de uma mesa fique vinculada a um `pdv_order` daquela mesa, e blindar o filtro contra `null === null`.

**1. Criar order ao abrir comanda em mesa livre** (`GarcomMesaDetalhe.tsx`)

No `handleNewComanda`:
- Se `table.current_order_id` existir → usar ele.
- Se `null` → chamar `createOrder({ source: "salao", table_id: table.id })`, atualizar `pdv_tables` setando `status: "ocupada"` e `current_order_id: order.id`, e só então `createComanda({ orderId: order.id, ... })`.

Isso replica o que `Salon.tsx` já faz no PDV web (linhas 325-328).

**2. Blindar o filtro de comandas por mesa** (`GarcomMesaDetalhe.tsx` linhas 26-28)

```ts
const tableComandas = table?.current_order_id
  ? comandas.filter(c => c.order_id === table.current_order_id && c.status === "aberta")
  : [];
```

Sem `current_order_id`, a mesa nunca lista comandas — evita o vazamento mesmo se sobrar dado legado.

**3. Migration de limpeza dos dados órfãos**

Para as comandas atuais com `order_id = NULL` que vieram de mesas (`customer_name LIKE 'Mesa %'`), criar um `pdv_order` para cada mesa, vincular as comandas e atualizar `pdv_tables.current_order_id`. Comandas avulsas reais (sem prefixo "Mesa") permanecem com `order_id = null` (correto — elas são avulsas mesmo).

**4. Atualizar status da mesa ao fechar/cancelar a última comanda**

Em `GarcomComandaDetalhe.tsx` no `closeComanda`: se a comanda tinha `order_id` e for a última `aberta` daquele order, marcar a mesa como `livre` e `current_order_id: null` (consistência com o fluxo do Salon).

### Validação

1. Logar como garçom, abrir Mesa 5 (livre), criar comanda, adicionar Negroni.
2. Voltar e abrir Mesa 6 (livre) → não deve mostrar o Negroni nem a comanda da Mesa 5.
3. Abrir Mesa 5 novamente → Negroni continua lá.
4. Conferir no banco: `pdv_comandas.order_id` preenchido e `pdv_tables.current_order_id` apontando para o mesmo order.

### Fora de escopo

- Refatorar a tela `Salon.tsx` (já funciona corretamente).
- Mudar regras de comanda avulsa (continua sem `order_id`, é o esperado).

