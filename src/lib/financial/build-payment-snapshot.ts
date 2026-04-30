import { supabase } from "@/integrations/supabase/client";
import {
  applyFeeFromCatalog,
  toSnapshotColumns,
  PaymentMethodFeeRecord,
  PaymentFeeBreakdown,
} from "@/lib/financial/payment-fees";
import { canonicalPaymentMethodKey } from "@/lib/financial/payment-method-keys";

/**
 * Busca o catálogo ativo de taxas do estabelecimento (cacheável).
 * Usa um cache curto em memória para evitar refetch em sequência durante
 * fluxos de pagamento múltiplo.
 */
const cache = new Map<string, { ts: number; rows: PaymentMethodFeeRecord[] }>();
const TTL = 30_000;

async function fetchFees(ownerUserId: string): Promise<PaymentMethodFeeRecord[]> {
  const cached = cache.get(ownerUserId);
  if (cached && Date.now() - cached.ts < TTL) return cached.rows;
  const { data } = await supabase
    .from("pdv_payment_method_fees")
    .select("method_key, fee_percentage, fee_fixed, is_active")
    .eq("user_id", ownerUserId);
  const rows = (data ?? []) as PaymentMethodFeeRecord[];
  cache.set(ownerUserId, { ts: Date.now(), rows });
  return rows;
}

export async function buildPaymentSnapshot(
  ownerUserId: string | null | undefined,
  rawMethod: string,
  grossAmount: number,
): Promise<{
  breakdown: PaymentFeeBreakdown;
  columns: ReturnType<typeof toSnapshotColumns>;
}> {
  if (!ownerUserId) {
    const breakdown = applyFeeFromCatalog(grossAmount, rawMethod, []);
    return { breakdown, columns: toSnapshotColumns(breakdown) };
  }
  const fees = await fetchFees(ownerUserId);
  const key = canonicalPaymentMethodKey(rawMethod);
  const breakdown = applyFeeFromCatalog(grossAmount, key, fees);
  return { breakdown, columns: toSnapshotColumns(breakdown) };
}
