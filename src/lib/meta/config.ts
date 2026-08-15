/**
 * Meta Pixel configuration.
 *
 * The Pixel ID is read from the Vite public env variable `VITE_META_PIXEL_ID`
 * so it can be configured per-environment without code changes. When the
 * variable is absent (e.g. local dev without a .env entry) it falls back to
 * the production Pixel ID so tracking keeps working.
 */

export const META_PIXEL_ID =
  (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? "886844317516110";

/** Currency used for all Meta event values — Algerian Dinar. */
export const META_CURRENCY = "DZD";

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: unknown;
  }
}

export type { FbqFunction };
