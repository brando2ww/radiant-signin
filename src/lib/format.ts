/**
 * Formatação canônica de valores monetários no padrão brasileiro.
 *
 * Use SEMPRE este helper para exibir valores em reais na UI.
 * Não use `toFixed(2)` precedido de "R$" — produz formato errado (ponto em vez
 * de vírgula, sem separador de milhar).
 *
 * Exemplos:
 *   formatBRL(49)        → "R$ 49,00"
 *   formatBRL(1234.5)    → "R$ 1.234,50"
 *   formatBRL("1234.56") → "R$ 1.234,56"
 *   formatBRL(null)      → "R$ 0,00"
 *   formatBRL(-50)       → "-R$ 50,00"
 */
const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return brlFormatter.format(0);
  }
  const n = typeof value === "string" ? Number(value) : value;
  return brlFormatter.format(Number.isFinite(n) ? n : 0);
}

/** Alias compatível com código legado. */
export const formatCurrency = formatBRL;

/**
 * Variante compacta sem casas decimais — útil para chips/badges curtos
 * e ticks de gráfico. Ex.: 1234 -> "R$ 1.234".
 */
const brlCompactFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatBRLCompact(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return brlCompactFormatter.format(0);
  }
  const n = typeof value === "string" ? Number(value) : value;
  return brlCompactFormatter.format(Number.isFinite(n) ? n : 0);
}

