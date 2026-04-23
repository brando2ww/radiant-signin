

## Mesa não fica "ocupada" porque RLS bloqueia o garçom

### Causa raiz (confirmada via banco)

A comanda **TESTE** foi criada com `order_id` válido apontando para a `pdv_orders` da Mesa 04. Porém na `pdv_tables`, **Mesa 04 está com `current_order_id = NULL` e `status = livre`**.

Motivo: a policy RLS de UPDATE em `pdv_tables` exige `auth.uid() = user_id` (apenas o dono). O garçom é staff do estabelecimento, então o `update` em `pdv_tables` **falha silenciosamente** (0 rows afetadas, sem erro) quando ele tenta marcar a mesa como ocupada. Como o front mostra "Mesa X" com base em `tables.find(t => t.current_order_id === comanda.order_id)`, o vínculo não aparece e a comanda fica como **Avulsa**.

Há também 2 comandas anteriores ("EDU TESTE" e "EDU TESTE 2") fechadas mas com order ainda `aberta` e mesa órfã — sintoma do mesmo problema.

### Mudança 1 — Migration de RLS em `pdv_tables`

Adicionar policy de UPDATE para staff do estabelecimento:

```sql
CREATE POLICY "Staff can update tables"
  ON public.pdv_tables
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));
```

A policy `"Owner can manage tables"` (FOR ALL) continua existindo para o dono. A nova só amplia UPDATE para staff — INSERT/DELETE seguem restritos ao dono.

### Mudança 2 — Migration de RLS em `pdv_orders`

Mesmo problema afeta `pdv_orders` (closeComanda atualiza `pdv_orders.status` quando a última comanda fecha). Verifico se existe policy de UPDATE para staff; se não, adicionar análoga:

```sql
CREATE POLICY "Staff can update orders"
  ON public.pdv_orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));
```

### Mudança 3 — Limpar dados órfãos (data fix)

Mesa 04 está com `current_order_id = null` mas tem order TESTE aberta. Reapontar:

```sql
-- Reabrir mesa para a order da comanda TESTE
UPDATE pdv_tables 
SET status = 'ocupada', current_order_id = '5e2bb496-bfc9-4ce8-b5c0-4df76a97bd36'
WHERE id = '64c11242-aba7-4c73-8a82-71284adc15db';

-- Fechar order órfã da comanda EDU TESTE 2 (cuja única comanda já está fechada)
UPDATE pdv_orders SET status = 'fechada' WHERE id = '9562e911-2d0d-4f97-94cb-a038ffc70ecd';
UPDATE pdv_orders SET status = 'fechada' WHERE id = '9402e942-ffe1-4d26-9867-f114dce03df7';
```

### Mudança 4 — Detectar falha silenciosa no código

Em `src/pages/garcom/GarcomMesaDetalhe.tsx` (função `handleConfirmOpen`), trocar o `update().eq()` por `update().eq().select()` e checar se retornou linha. Se 0 rows e sem erro (caso de RLS), mostrar `toast.error("Sem permissão para atualizar mesa")` em vez de seguir como se tivesse dado certo. Mesma proteção em `closeComandaMutation` (`use-pdv-comandas.ts`) ao atualizar `pdv_orders` e `pdv_tables`.

### Validação

- Garçom abre Mesa 5 com nome "Pedro" → mesa fica `ocupada` na lista, comanda do Pedro abre com chip **"Mesa 5"** no header.
- Em `/garcom/comandas`, "Pedro" aparece como `Mesa 5 · 0 itens · R$ 0,00`.
- Garçom fecha a única comanda → mesa volta para `livre`.
- Mesa 04 atual recupera o vínculo com TESTE após o data fix.

