

## Plano: corrigir bug de pagamento duplicado

### Problema
O pagamento pode ser registrado duas vezes porque:
1. Não há proteção contra duplo clique no `handleSubmit` (o botão desabilita via React, mas cliques rápidos passam antes do re-render)
2. A mutation não verifica se a comanda já está fechada antes de processar, permitindo reprocessamento
3. As operações não são atômicas: se falha no meio, a comanda já foi fechada mas o caixa não registrou a venda; ao tentar novamente, duplica a venda no caixa

### Correções

**1. `src/components/pdv/cashier/PaymentDialog.tsx`**
- Adicionar guard no início de `handleSubmit`: `if (isProcessing) return;`
- Isso impede duplo processamento mesmo com cliques rápidos

**2. `src/hooks/use-pdv-payments.ts` — `registerPayment`**
- Antes de fechar a comanda, verificar se `status = 'aberta'` na query de update: `.eq("status", "aberta")`
- Checar se alguma linha foi atualizada (verificar o retorno). Se nenhuma linha foi afetada, significa que a comanda já foi fechada; lançar erro "Comanda já finalizada"
- Isso impede que uma segunda tentativa duplique a venda no caixa

**3. `src/hooks/use-pdv-payments.ts` — `registerTablePayment`**
- Mesma lógica: adicionar `.in("status", ["aberta"])` no update das comandas da mesa
- Verificar se ao menos uma comanda foi atualizada antes de prosseguir com registro no caixa

### Arquivos
- **Editado:** `src/components/pdv/cashier/PaymentDialog.tsx` (guard contra duplo clique)
- **Editado:** `src/hooks/use-pdv-payments.ts` (verificação de status antes de fechar + validação de linhas afetadas)

