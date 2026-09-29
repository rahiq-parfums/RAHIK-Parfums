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

/** Campus delivery lands inside the residence itself, so it carries no fare. */
export const CAMPUS_DELIVERY_PRICE = 0;
