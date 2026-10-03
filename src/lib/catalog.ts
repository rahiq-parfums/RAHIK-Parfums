/**
 * Catalogue domain types shared by the public data layer, the Dashboard and
 * the customer-facing components.
 *
 * This module intentionally contains **no data**. Every perfume, offer and
 * discount value comes from Supabase through `src/lib/data.ts`, which is fed
 * by the Dashboard. Nothing here may hardcode a product or offer list.
 */

export type Bilingual = { ar: string; en: string };

export type BadgeKey = "original" | "ordinary" | "fois2" | "fois3";

export type VersionLabel = { ar: string; en: string };

/**
 * The single, canonical Men / Women / Unisex classification of a perfume.
 * Managed from the Dashboard (`perfumes.gender`) and consumed by the Home
 * filters — never duplicated in the frontend.
 */
export type PerfumeGender = "men" | "women" | "unisex";

export type Perfume = {
  id: string;
  /**
   * `perfumes.id` (the Supabase UUID), kept so a perfume can be joined to the
   * offers that reference it through `offer_perfumes.perfume_id`. `id` remains
   * the slug because that is what the public routes and React Query keys use.
   */
  dbId?: string;
  gender: PerfumeGender;
  /**
   * The individual selling price of this perfume, from `perfumes.price`.
   *
   * This is a real product price set in the Dashboard, never a collection price
   * and never derived from an offer. It is `null` only while a newly added or
   * existing perfume still has no individual price entered, which is why the
   * customer-facing views must handle it instead of inventing a number.
   */
  price: number | null;
  name: Bilingual;
  image: string;
  badges: BadgeKey[];
  versions: VersionLabel[];
  ratings: {
    seasons: { spring: number; summer: number; autumn: number; winter: number };
    time: { day: number; night: number };
    community: number;
    reactions: { loved: number; liked: number; disliked: number };
  };
};

export type Offer = {
  id: string;
  /**
   * Men / Women / Unisex classification from `offers.gender`, managed in the
   * Dashboard with the same three values as `PerfumeGender`.
   */
  gender: PerfumeGender;
  name: Bilingual;
  description: Bilingual;
  longDescription?: Bilingual;
  images: string[];
  price: number;
  oldPrice?: number;
  maxQuantity?: number;
  includes: Bilingual[];
  perfumes: {
    perfumeId?: string | null;
    name: Bilingual;
    image: string;
    description: Bilingual;
  }[];
};
