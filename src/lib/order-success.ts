/**
 * Order success state — passes the completed order summary from the
 * OrderForm to the /order-success route without a database.
 *
 * The state is stored in sessionStorage so it survives the navigation but
 * is scoped to the session and not persisted long-term. The /order-success
 * route reads it to display the summary; direct visits without a valid
 * completed order show a safe empty state instead of firing a Purchase.
 */

export interface OrderSuccessState {
  orderRef: string;
  offerName: string;
  quantity: number;
  unitPrice: number;
  deliveryPrice: number;
  total: number;
}

const KEY = "rahiq-order-success";

export function setOrderSuccessState(state: OrderSuccessState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function getOrderSuccessState(): OrderSuccessState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderSuccessState;
    if (!parsed.orderRef || typeof parsed.total !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOrderSuccessState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Generates a unique client-side order reference, e.g. "RAHIQ-8F3K2P9Q".
 * Uses crypto.randomUUID when available, with a timestamp+random fallback.
 */
export function generateOrderRef(): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase().slice(-4) +
        Math.random().toString(36).toUpperCase().slice(2, 6);
  return `RAHIQ-${random}`;
}
