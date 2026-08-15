/**
 * Meta Standard Event helpers.
 *
 * Each function wraps a specific Meta Standard Event with typed parameters.
 * Callers pass business data; the helpers build the correct event payload.
 */

import { META_CURRENCY } from "./config";
import { trackEvent } from "./pixel.ts";

export interface ViewContentParams {
  contentIds: string[];
  contentName: string;
  contentType?: string;
  value: number;
}

export interface InitiateCheckoutParams {
  contentIds: string[];
  contentName: string;
  quantity: number;
  value: number;
}

export interface PurchaseParams {
  contentIds: string[];
  contentName: string;
  contentType?: string;
  numItems: number;
  value: number;
}

/** Track a PageView event. */
export function trackPageView(): void {
  trackEvent("PageView");
}

/** Track a ViewContent event for an offer/product page view. */
export function trackViewContent(params: ViewContentParams): void {
  trackEvent("ViewContent", {
    content_ids: params.contentIds,
    content_name: params.contentName,
    content_type: params.contentType ?? "product",
    value: params.value,
    currency: META_CURRENCY,
  });
}

/** Track an InitiateCheckout event when the user starts the order process. */
export function trackInitiateCheckout(params: InitiateCheckoutParams): void {
  trackEvent("InitiateCheckout", {
    content_ids: params.contentIds,
    content_name: params.contentName,
    quantity: params.quantity,
    value: params.value,
    currency: META_CURRENCY,
  });
}

/**
 * Track a Purchase event. The `orderRef` is passed as the `eventID` so Meta
 * can deduplicate browser events against server-side Conversions API events
 * if they are added later. Local deduplication (in index.ts) prevents
 * double-firing for the same order reference on refresh / re-mount.
 */
export function trackPurchase(params: PurchaseParams, orderRef: string): void {
  trackEvent("Purchase", {
    content_ids: params.contentIds,
    content_name: params.contentName,
    content_type: params.contentType ?? "product",
    num_items: params.numItems,
    value: params.value,
    currency: META_CURRENCY,
    eventID: orderRef,
  });
}
