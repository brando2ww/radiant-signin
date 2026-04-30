# Taxas por forma de pagamento + valor líquido automático

Hoje o sistema só guarda `payment_method` (texto) em `pdv_payments` e `pdv_financial_transactions`, sem percentual de taxa, sem taxa fixa e sem valor líquido. A aba "Financeiro" das configurações do PDV tem campos de taxa por método, mas não são usados nos cálculos. Vou criar uma estrutura dedicada, persistir o snapshot da taxa em cada transação e propagar ao Caixa, Financeiro, DRE e relatórios.

## 1. Banco de dados (migração)

**Nova tabela `pdv_payment_method_fees`** (catálogo configurável):
- `id`, `user_id` (dono do estabelecimento), `method_key` (ex: `credit`, `pix`, `debit`, `cash`, `ifood`, ou customizado), `label`, `fee_percentage` (numeric, default 0), `fee_fixed` (numeric, default 0), `is_active` (bool), `notes` (text), `created_at`, `updated_at`.
- Unique `(user_id, method_key)`.
- RLS: dono + `is_establishment_member(user_id)` para SELECT; INSERT/UPDATE/DELETE só para o dono.
- Seed automático na primeira leitura (no hook): Crédito 3%, Débito 1%, Pix 1%, Dinheiro 0%, iFood 25%.

**Snapshot da taxa nas transações** (colunas novas, todas nullable para retrocompatibilidade):
- `pdv_payments`: `gross_amount`, `fee_percentage_applied`, `fee_fixed_applied`, `fee_amount`, `net_amount`.
- `pdv_financial_transactions`: mesmas 5 colunas.
- Backfill inicial: `gross_amount = amount`, `net_amount = amount`, taxas zero para registros existentes.

Regra: `amount` continua representando o **bruto** (compatibilidade total). Alterar `pdv_payment_method_fees` depois **não** recalcula histórico — leitura sempre vem das colunas snapshot.

## 2. Camada de cálculo (frontend)

Novo `src/lib/financial/payment-fees.ts`:
- `calculateNetAmount(gross, { fee_percentage, fee_fixed })` → `{ gross, feePercentageAmount, feeFixedAmount, feeTotal, net }`.
- Fórmula: `net = gross - (gross * fee% / 100) - fee_fixed` (nunca negativo).
- `applyFeeFromCatalog(gross, methodKey, fees[])` resolve a taxa ativa do método; se inativa/inexistente, usa zero.

Novo hook `src/hooks/use-payment-method-fees.ts`:
- `usePaymentMethodFees()`, `useUpsertPaymentMethodFee`, `useDeletePaymentMethodFee`, `useTogglePaymentMethodFee`.
- Resolve `establishment_owner_id` via `use-establishment-id`.

## 3. Configurações administrativas

Substituir a seção "Métodos de Pagamento Aceitos" do `FinancialTab.tsx` por um CRUD completo:
- Tabela com colunas: Método, Label, % Taxa, Taxa Fixa (BRL), Ativo (toggle), Observações, Ações (⋮: Editar / Excluir).
- Botão "Adicionar forma de pagamento" abrindo dialog para método personalizado (ex: Vale-refeição, Voucher).
- Inputs com `CurrencyInput` para taxa fixa e máscara `%` para percentual.
- Preview ao vivo: "Venda de R$ 100 → líquido R$ 97,00".
- Acesso restrito a admin (guards já existentes em SettingsPage).

## 4. Captura do snapshot nas vendas

Pontos que passam a calcular e persistir bruto/taxa/líquido antes do `INSERT`:
- `src/hooks/use-pdv-payments.ts` — todos os 5 inserts em `pdv_payments` (linhas ~167, 194, 304, 401, 478).
- `src/hooks/use-pdv-financial-transactions.ts` — `createTransaction` e `markAsPaid`.
- `PDVTransactionDialog.tsx`, `MarkAsPaidDialog.tsx` (financial e bills): preview do líquido sob o campo Valor.
- `PaymentDialog.tsx` do caixa: ao lado de cada método selecionado, "Líquido: R$ X (taxa Y% + R$ Z fixo)".

## 5. Caixa, Financeiro, DRE e Relatórios

- `CashierStatement.tsx`, `CloseCashierDialog.tsx`, `CashierSummaryFooter.tsx`: somar bruto, taxas e líquido; exibir 3 totais e quebra por método.
- `FinancialTransactions.tsx`: nova coluna "Líquido" e total no rodapé (filtro por método já existe).
- `CashFlow.tsx`: usar `net_amount` para saldo realizado, manter bruto numa coluna auxiliar.
- `DRE.tsx`: nova linha "(-) Taxas de meios de pagamento" entre Receita Bruta e Receita Líquida.
- `PaymentMethodChart.tsx`: tooltip com bruto vs líquido.
- Novo bloco "Taxas por período" dentro de `CashierStatement` (ou seção em `FinancialTransactions`): tabela por período × método com Bruto / % / Taxa fixa / Taxa total / Líquido + linha de totais.

## 6. Critérios de aceite cobertos

- Admin configura sem código → CRUD em Configurações.
- Cada método tem sua taxa → tabela com unique `(user_id, method_key)`.
- Cálculo automático e snapshot por transação.
- Histórico imutável diante de alterações futuras.
- Suporte a % e taxa fixa simultâneos.
- Relatórios e DRE com bruto, taxas e líquido + comparativo por método.

## Detalhes técnicos

```text
Venda credit R$100, taxa 3% + R$0,50:
  gross_amount             = 100.00
  fee_percentage_applied   = 3
  fee_fixed_applied        = 0.50
  fee_amount               = 3.50
  net_amount               = 96.50
```

Migração resumida:
```sql
CREATE TABLE pdv_payment_method_fees (...);
ALTER TABLE pdv_payments
  ADD COLUMN gross_amount numeric,
  ADD COLUMN fee_percentage_applied numeric DEFAULT 0,
  ADD COLUMN fee_fixed_applied numeric DEFAULT 0,
  ADD COLUMN fee_amount numeric DEFAULT 0,
  ADD COLUMN net_amount numeric;
-- mesmas colunas em pdv_financial_transactions
UPDATE pdv_payments SET gross_amount = amount, net_amount = amount WHERE gross_amount IS NULL;
```

## Fora do escopo

- Recálculo retroativo de transações antigas (regra explícita do pedido).
- Aplicação de taxas no checkout do delivery público (apenas registro/relatórios do lado do lojista nesta entrega).
- Repasse de taxa de adquirente por bandeira/parcela (apenas por método nesta versão).
