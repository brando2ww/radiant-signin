/**
 * Formata o nome de exibição de uma mesa, evitando o prefixo duplicado
 * "Mesa Mesa X". Aceita valores como "4", "Mesa 04" ou "mesa 02".
 */
export function formatTableLabel(tableNumber: string | number | null | undefined): string {
  const value = (tableNumber == null ? "" : String(tableNumber)).trim();
  if (!value) return "Mesa";
  if (/^mesa\b/i.test(value)) {
    const rest = value.replace(/^mesa\s*/i, "").trim();
    return rest ? `Mesa ${rest}` : "Mesa";
  }
  return `Mesa ${value}`;
}
