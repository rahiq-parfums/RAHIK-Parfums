/**
 * Algerian Dinar is the only supported currency.
 * Prices are displayed in the familiar local format, e.g. "2,500 DA".
 */
export function formatPrice(amount: number): string {
  return `${new Intl.NumberFormat("en-US").format(Math.round(amount))} DA`;
}
