/**
 * Meta Pixel loader and initializer.
 *
 * Loads the fbevents.js script exactly once, initializes the Pixel with the
 * configured ID, and guards against duplicate initialization caused by
 * React re-renders, Strict Mode, or repeated calls.
 */

import { META_PIXEL_ID, type FbqFunction } from "./config";

let initialized = false;
let scriptLoaded = false;

/**
 * Injects the fbevents.js base snippet and initializes the Pixel.
 * Safe to call multiple times — initialization happens exactly once.
 */
export function initPixel(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;

  if (window.fbq) {
    initialized = true;
    return;
  }

  const fbq: FbqFunction = function (...args: unknown[]) {
    if (typeof fbq.callMethod === "function") {
      fbq.callMethod.apply(fbq, args as never);
    } else {
      fbq.queue?.push(args);
    }
  } as FbqFunction;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = window._fbq ?? fbq;

  if (!scriptLoaded && typeof document !== "undefined") {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
    scriptLoaded = true;
  }

  window.fbq("init", META_PIXEL_ID);
  initialized = true;
}

/**
 * Tracks a Meta Standard Event (or custom event) via fbq.
 * If the Pixel hasn't been initialized yet, this is a no-op.
 */
export function trackEvent(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.fbq || !initialized) return;
  window.fbq("track", event, params);
}

/**
 * Returns the base <noscript> fallback img markup for the Pixel.
 * Used in the root shell so the noscript PageView fallback keeps working.
 */
export function pixelNoscriptMarkup(): string {
  return `<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"
/>`;
}
