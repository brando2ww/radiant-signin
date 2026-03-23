

## Desconto com motivo, senha por usuário e limite máximo

### Resumo
Hoje o desconto usa senha fixa "1234" hardcoded. A proposta:
1. Cada usuário terá **senha numérica de desconto** e **desconto máximo permitido (%)** configurados no cadastro de usuários
2. Ao aplicar desconto no pagamento, o operador deve informar o **motivo do desconto** (campo obrigatório)
3. A autorização valida a senha contra os usuários cadastrados e verifica se o desconto está dentro do limite do autorizador
4. O motivo e quem autorizou ficam registrados no `pdv_cashier_movements` e aparecem no **relatório de fechamento de caixa**

### Mudanças no banco de dados

**Migração 1**: Adicionar colunas na tabela `establishment_users`:
- `discount_password` (text) — senha numérica para autorizar descontos
- `max_discount_percent` (numeric, default 100) — desconto máximo permitido em %

**Migração 2**: Adicionar colunas na tabela `pdv_cashier_movements`:
- `discount_reason` (text) — motivo do desconto
- `discount_authorized_by` (text) — nome de quem autorizou

### Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/add_discount_fields.sql` | Criar migração com as 4 colunas novas |
| `src/components/pdv/users/UserDialog.tsx` | Adicionar campos "Senha de desconto" (numérico, 4-6 dígitos) e "Desconto máximo (%)" no formulário |
| `src/hooks/use-pdv-users.ts` | Incluir `discount_password` e `max_discount_percent` nas mutations de create/update |
| `src/components/pdv/cashier/PaymentDialog.tsx` | (1) Adicionar campo "Motivo do desconto" obrigatório quando há desconto. (2) Substituir validação hardcoded "1234" por busca em `establishment_users` comparando `discount_password`. (3) Validar se o % de desconto está dentro do `max_discount_percent` do autorizador. (4) Salvar `discount_reason` e `discount_authorized_by` no registro de movimento do caixa |
| `src/hooks/use-pdv-payments.ts` | Aceitar e persistir `discount_reason` e `discount_authorized_by` no insert de `pdv_cashier_movements` |
| `src/components/pdv/CloseCashierDialog.tsx` | Incluir seção "Descontos Aplicados" no relatório de impressão, listando motivo, autorizador e valor |
| `src/integrations/supabase/types.ts` | Atualizar tipos para incluir as novas colunas |

### Fluxo de autorização de desconto

```text
Operador aplica desconto de 15%
→ Campo "Motivo" aparece (obrigatório): "Cliente frequente"
→ Campo "Senha de autorização" aparece
→ Digita senha → sistema busca establishment_users com discount_password = senha
→ Encontrou? Verifica max_discount_percent do autorizador
  → 15% <= limite? → "Desconto autorizado por [Nome]" ✓
  → 15% > limite? → "Desconto acima do limite permitido para [Nome] (máx X%)"
→ Não encontrou? → "Senha incorreta"
```

### Relatório de fechamento

A seção de movimentações do relatório passará a mostrar uma coluna/linha extra para vendas com desconto, indicando:
- Valor do desconto
- Motivo
- Autorizado por

