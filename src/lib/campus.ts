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
  { ar: "الإقامة الجامعية 1", en: "University Residence 1" },
  { ar: "الإقامة الجامعية 2", en: "University Residence 2" },
  { ar: "الإقامة الجامعية 3", en: "University Residence 3" },
  { ar: "الإقامة الجامعية 4", en: "University Residence 4" },
  { ar: "الإقامة الجامعية 5", en: "University Residence 5" },
  { ar: "الإقامة الجامعية 6", en: "University Residence 6" },
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
export const CAMPUS_PARAM_VALUE = "1";

/**
 * Campus context is carried in the URL so it survives Home → catalogue →
 * checkout navigation without any global state. A missing or falsy value means
 * a normal order.
 */
export function isCampusContext(value: unknown): boolean {
  return value === CAMPUS_PARAM_VALUE || value === true;
}

/** Builds the `search` object needed to keep the Campus context alive. */
export function campusSearch(campus: boolean): { campus?: string } {
  return campus ? { [CAMPUS_PARAM]: CAMPUS_PARAM_VALUE } : {};
}
