/**
 * Meta Pixel tracking module — public API.
 *
 * Centralizes Pixel initialization, event tracking, and Purchase
 * deduplication so the rest of the app never calls raw `fbq`.
 *
 * Usage:
 *   import { meta } from "@/lib/meta";
 *   meta.init();
 *   meta.pageView();
 *   meta.viewContent({ contentIds: [offer.id], contentName: offer.name, value: price });
 *   meta.initiateCheckout({ ... });
 *   meta.purchase({ ... }, orderRef);
 */

import { initPixel, trackEvent, pixelNoscriptMarkup } from "./pixel";
import {
  trackPageView,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  type ViewContentParams,
  type InitiateCheckoutParams,
  type PurchaseParams,
} from "./events";

export type { ViewContentParams, InitiateCheckoutParams, PurchaseParams };

// ─── Purchase deduplication ──────────────────────────────────────────────────
//
// Keeps a client-side record of order references whose Purchase event has
// already been sent. This prevents duplicate Purchase events when the
// /order-success page is refreshed, reopened via back/forward, or re-rendered
// by React Strict Mode.

const PURCHASE_TRACKED_KEY = "rahiq-meta-purchased-refs";
const MAX_TRACKED_REFS = 100;

function readTrackedRefs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_TRACKED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeTrackedRefs(refs: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(refs).slice(-MAX_TRACKED_REFS);
    window.sessionStorage.setItem(PURCHASE_TRACKED_KEY, JSON.stringify(arr));
  } catch {
    // ignore quota / serialization errors
  }
}

/** Returns true if a Purchase event has already been sent for this order ref. */
export function isPurchaseTracked(orderRef: string): boolean {
  return readTrackedRefs().has(orderRef);
}

/** Marks an order ref as having had its Purchase event sent. */
export function markPurchaseTracked(orderRef: string): void {
  const refs = readTrackedRefs();
  if (refs.has(orderRef)) return;
  refs.add(orderRef);
  writeTrackedRefs(refs);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const meta = {
  /** Initialize the Meta Pixel. Safe to call multiple times. */
  init: initPixel,

  /** Track a PageView event. */
  pageView: trackPageView,

  /** Track a ViewContent event. */
  viewContent: trackViewContent,

  /** Track an InitiateCheckout event. */
  initiateCheckout: trackInitiateCheckout,

  /**
   * Track a Purchase event for a successfully completed order.
   * Deduplicated by orderRef — calling twice with the same ref is a no-op
   * on the second call.
   */
  purchase: (params: PurchaseParams, orderRef: string): void => {
    if (isPurchaseTracked(orderRef)) return;
    trackPurchase(params, orderRef);
    markPurchaseTracked(orderRef);
  },

  /** Raw track escape hatch for custom events (not currently used). */
  track: trackEvent,

  /** noscript fallback markup for the root shell. */
  noscriptMarkup: pixelNoscriptMarkup,
};

export { META_PIXEL_ID, META_CURRENCY } from "./config";
