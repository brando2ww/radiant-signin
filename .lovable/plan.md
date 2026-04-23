

## Mesa = 1 comanda principal por padrão, com nominais opcionais

### Diagnóstico

Na verdade, **nenhum item está criando comanda nova**. O fluxo `GarcomAdicionarItem` apenas faz `addItem({ comandaId, ... })` na comanda já existente — está correto. O que confunde é o botão **"Nova Comanda"** dentro da `GarcomMesaDetalhe`: o garçom toca achando que é "adicionar item" e o sistema de fato cria outra comanda na mesma mesa. Some a isso o fato de que a tela cai direto na lista de comandas (quando já existe uma) em vez de abrir a única comanda existente, e o garçom precisa de cliques extras para chegar nos itens.

A regra escolhida (1 mesa = 1 comanda padrão, com possibilidade de criar nominais) resolve essas duas dores.

### Mudanças

**1. `GarcomMesaDetalhe.tsx` — comportamento "1 comanda padrão"**

- Quando o garçom toca numa mesa **livre**: criar `pdv_order` + 1 comanda padrão (nome `Mesa N`) automaticamente e navegar direto para `/garcom/comanda/:id`. Sem tela intermediária.
- Quando a mesa **tem exatamente 1 comanda aberta**: redirecionar direto para essa comanda (`useEffect` com `navigate(..., { replace: true })`).
- Quando a mesa tem **2+ comandas** (caso a divisão nominal já tenha sido criada): mostrar a lista atual.
- Trocar o botão **"Nova Comanda"** por **"Dividir em comanda nominal"** (ícone `UserPlus`), com um diálogo simples pedindo nome do cliente. Só esse botão cria comandas adicionais — não há mais como criar comanda "anônima" duplicada por engano.

**2. `use-pdv-comandas.ts` — guard contra duplicata acidental**

Em `createComandaMutation`, antes do `INSERT`, fazer `SELECT` por `(order_id, status='aberta')`:
- Se `orderId` foi passado e já existe comanda aberta para esse order **sem** `customerName` explicitamente diferente do padrão `Mesa N`, retornar a existente em vez de criar (idempotência leve).
- O caminho "nominal" (com `customerName` informado pelo usuário no diálogo) sempre cria.

Isso evita race condition: dois cliques rápidos no mesmo botão geram no máximo uma comanda padrão.

**3. Constraint no banco — bloqueio definitivo de duplicata padrão**

Índice único parcial garantindo no máximo 1 comanda **sem nome de cliente** por order:

```sql
CREATE UNIQUE INDEX uniq_default_comanda_per_order
ON pdv_comandas (order_id)
WHERE status = 'aberta' AND customer_name IS NULL;
```

Comandas nominais (com `customer_name` preenchido) continuam podendo ser várias por order — é o caso da divisão de conta.

> Observação: hoje a tela passa `customerName: "Mesa N"` para a comanda padrão. Vou trocar para `null` na comanda padrão e usar `Mesa N` apenas como label de exibição (fallback no front), para o índice acima funcionar como diferenciador semântico (NULL = padrão, preenchido = nominal).

**4. Limpeza de dados (sua escolha: excluir todas as abertas)**

Migration única que cancela todas as comandas hoje com `status = 'aberta'` e libera as mesas:

```sql
UPDATE pdv_comandas SET status = 'cancelada', updated_at = now()
WHERE status = 'aberta';

UPDATE pdv_orders SET status = 'cancelada', updated_at = now()
WHERE status = 'aberta';

UPDATE pdv_tables SET status = 'livre', current_order_id = NULL
WHERE status <> 'livre';
```

Isso zera o estado operacional. O usuário precisa estar ciente: **qualquer atendimento em andamento agora será descartado**. Se houver caixa aberto com vendas em curso, melhor rodar essa limpeza fora do horário de movimento.

### Validação

1. Mesa livre → tocar → cai direto na tela da comanda (sem passo intermediário).
2. Adicionar 3 itens → todos aparecem na MESMA comanda. Voltar e abrir a mesa de novo → continua na mesma comanda.
3. Tocar duas vezes muito rápido em "Abrir Comanda" (rede lenta) → só uma comanda criada (constraint + guard).
4. Na comanda, tocar em "Dividir em comanda nominal", informar "João" → nova comanda nominal aparece. A mesa agora mostra a lista com as 2 comandas (padrão + João).
5. Banco: `SELECT order_id, count(*) FROM pdv_comandas WHERE status='aberta' AND customer_name IS NULL GROUP BY 1 HAVING count(*) > 1;` → 0 linhas, sempre.

### Fora de escopo

- Refatorar a tela do PDV web (`Salon.tsx`) — ela continua suportando multi-comanda como hoje, sem mudança.
- Mover itens entre comandas nominais (transferência de itens) — pode entrar depois se necessário.

