/**
 * Cálculo de taxas por forma de pagamento.
 *
 * Fórmula:
 *   net = gross - (gross * fee_percentage / 100) - fee_fixed
 *
 * O resultado nunca é negativo. Se a taxa exceder o bruto, o líquido é zero
 * mas o snapshot ainda preserva os valores aplicados para auditoria.
 */

export interface PaymentFeeConfig {
  fee_percentage: number;
  fee_fixed: number;
}

export interface PaymentFeeBreakdown {
  gross: number;
  fee_percentage_applied: number;
  fee_fixed_applied: number;
  fee_percentage_amount: number;
  fee_fixed_amount: number;
  fee_total: number;
  net: number;
}

const ZERO_BREAKDOWN = (gross: number): PaymentFeeBreakdown => ({
  gross,
  fee_percentage_applied: 0,
  fee_fixed_applied: 0,
  fee_percentage_amount: 0,
  fee_fixed_amount: 0,
  fee_total: 0,
  net: gross,
});

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateNetAmount(
  gross: number,
  fee: PaymentFeeConfig | null | undefined,
): PaymentFeeBreakdown {
  const safeGross = Number.isFinite(gross) ? Math.max(0, gross) : 0;
  if (!fee) return ZERO_BREAKDOWN(safeGross);

  const pct = Number.isFinite(fee.fee_percentage) ? Math.max(0, fee.fee_percentage) : 0;
  const fixed = Number.isFinite(fee.fee_fixed) ? Math.max(0, fee.fee_fixed) : 0;

  const pctAmount = round2((safeGross * pct) / 100);
  const fixedAmount = round2(fixed);
  const total = round2(pctAmount + fixedAmount);
  const net = Math.max(0, round2(safeGross - total));

  return {
    gross: round2(safeGross),
    fee_percentage_applied: pct,
    fee_fixed_applied: fixedAmount,
    fee_percentage_amount: pctAmount,
    fee_fixed_amount: fixedAmount,
    fee_total: total,
    net,
  };
}

export interface PaymentMethodFeeRecord {
  method_key: string;
  fee_percentage: number;
  fee_fixed: number;
  is_active: boolean;
}

export function findFeeForMethod(
  methodKey: string | null | undefined,
  fees: PaymentMethodFeeRecord[] | null | undefined,
): PaymentFeeConfig | null {
  if (!methodKey || !fees?.length) return null;
  const match = fees.find(
    (f) => f.is_active && f.method_key.toLowerCase() === methodKey.toLowerCase(),
  );
  if (!match) return null;
  return { fee_percentage: match.fee_percentage, fee_fixed: match.fee_fixed };
}

export function applyFeeFromCatalog(
  gross: number,
  methodKey: string | null | undefined,
  fees: PaymentMethodFeeRecord[] | null | undefined,
): PaymentFeeBreakdown {
  return calculateNetAmount(gross, findFeeForMethod(methodKey, fees));
}

/** Snapshot pronto para gravar nas colunas das tabelas pdv_payments / pdv_financial_transactions. */
export function toSnapshotColumns(breakdown: PaymentFeeBreakdown) {
  return {
    gross_amount: breakdown.gross,
    fee_percentage_applied: breakdown.fee_percentage_applied,
    fee_fixed_applied: breakdown.fee_fixed_applied,
    fee_amount: breakdown.fee_total,
    net_amount: breakdown.net,
  };
}
