import type { Bilingual } from "@/lib/catalog";

/**
 * RAHIQ Campus — delivery to university residences.
 *
 * The residence list is the fixed commercial offer of this feature; it is the
 * only academic detail ever asked from a student. Everything else in the
 * checkout (name, phone, order data, email notification) is the existing flow.
 */
export const CAMPUS_IMAGE =
  "https://res.cloudinary.com/wujk2wjc/image/upload/v1790700944/compus_yingzv.jpg";

export const CAMPUS_RESIDENCES: Bilingual[] = [
  { ar: "الإقامة معالمة 1", en: "Residence Mehalma 1" },
  { ar: "الإقامة معالمة 2", en: "Residence Mehalma 2" },
  { ar: "الإقامة معالمة 3", en: "Residence Mehalma 3" },
  { ar: "الإقامة معالمة 4", en: "Residence Mehalma 4" },
  { ar: "الإقامة معالمة 5", en: "Residence Mehalma 5" },
  { ar: "الإقامة معالمة 6", en: "Residence Mehalma 6" },
];

/**
 * Flat delivery fee for RAHIQ Campus, in DZD.
 *
 * This is a fixed commercial price for delivering inside the university
 * residence. It is intentionally a constant rather than a Dashboard row: the
 * existing Dashboard drives *wilaya* delivery prices only, and Campus is not a
 * wilaya. It is applied on top of the order subtotal, exactly like a normal
 * delivery fee, and never replaces the normal wilaya pricing.
 */
export const CAMPUS_DELIVERY_PRICE = 50;

/** Search-param key used to carry Campus context across navigation. */
export const CAMPUS_PARAM = "campus";

/** Value of {@link CAMPUS_PARAM} that activates the Campus context. */
export const CAMPUS_PARAM_VALUE = 1;

/** The validated shape of the Campus search param on any public route. */
export type CampusSearch = { campus?: number };

/**
 * Campus context is carried in the URL so it survives Home → catalogue →
 * checkout navigation without any global state. A missing or falsy value means
 * a normal order.
 *
 * Every form of the flag is accepted: the router parses `?campus=1` into the
 * number `1`, and a hand-written `?campus=true` should mean the same thing.
 */
export function isCampusContext(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === CAMPUS_PARAM_VALUE;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === String(CAMPUS_PARAM_VALUE) || normalized === "true";
}

/**
 * Builds the `search` object needed to keep the Campus context alive.
 *
 * The value is numeric on purpose: the router JSON-encodes search strings that
 * happen to be valid JSON, which would turn the readable `?campus=1` into
 * `?campus=%221%22`. A number serialises to exactly `?campus=1`.
 */
export function campusSearch(campus: boolean): CampusSearch {
  return campus ? { campus: CAMPUS_PARAM_VALUE } : {};
}
