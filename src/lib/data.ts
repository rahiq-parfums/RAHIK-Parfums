/**
 * Shared Supabase data hooks consumed by both public pages and admin.
 * Replaces the localStorage admin-store for all data reads.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BadgeKey, Perfume, PerfumeGender, Offer } from "@/lib/catalog";

// ─── Perfumes ─────────────────────────────────────────────────────────────────

type DbPerfume = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  main_image: string;
  gender: string | null;
  rating_spring: number;
  rating_summer: number;
  rating_autumn: number;
  rating_winter: number;
  rating_day: number;
  rating_night: number;
  rating_loved: number;
  rating_good: number;
  rating_not_recommended: number;
  community_score: number;
  is_visible: boolean;
  display_order: number;
  perfume_versions: { label_ar: string; label_en: string; display_order: number }[];
};

/** Normalises any stored gender value to the canonical catalogue value. */
export function toPerfumeGender(value: string | null | undefined): PerfumeGender {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "women" || v === "female" || v === "f" || v === "نسائية" || v === "نساء") {
    return "women";
  }
  if (v === "men" || v === "male" || v === "m" || v === "رجالية" || v === "رجاء") {
    return "men";
  }
  return "unisex";
}

/** Normalises a stored version label to a known `BadgeKey`, dropping unknowns. */
export function toBadgeKey(value: string): BadgeKey | null {
  const v = value.trim().toLowerCase().replace(/\s+/g, "");
  if (v === "original" || v === "أصلي") return "original";
  if (v === "ordinary" || v === "عادي" || v === "ordinarysize") return "ordinary";
  if (v === "fois2" || v === "2fois" || v === "ضعف") return "fois2";
  if (v === "fois3" || v === "3fois" || v === "ثلاثي") return "fois3";
  return null;
}

function dbPerfumeToCatalog(p: DbPerfume): Perfume {
  return {
    id: p.slug,
    dbId: p.id,
    gender: toPerfumeGender(p.gender),
    name: { ar: p.name_ar, en: p.name_en },
    image: p.main_image,
    badges: p.perfume_versions
      .sort((a, b) => a.display_order - b.display_order)
      .map((v) => toBadgeKey(v.label_en))
      .filter((b): b is BadgeKey => b !== null),
    versions: p.perfume_versions
      .sort((a, b) => a.display_order - b.display_order)
      .map((v) => ({ ar: v.label_ar, en: v.label_en })),
    ratings: {
      seasons: {
        spring: p.rating_spring,
        summer: p.rating_summer,
        autumn: p.rating_autumn,
        winter: p.rating_winter,
      },
      time: { day: p.rating_day, night: p.rating_night },
      community: p.community_score,
      reactions: {
        loved: p.rating_loved,
        liked: p.rating_good,
        disliked: p.rating_not_recommended,
      },
    },
  };
}

export function usePerfumes(visibleOnly = true) {
  return useQuery({
    queryKey: ["perfumes", visibleOnly],
    queryFn: async () => {
      let q = supabase.from("perfumes").select("*, perfume_versions(*)").order("display_order");
      if (visibleOnly) q = q.eq("is_visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data as DbPerfume[]).map(dbPerfumeToCatalog);
    },
    staleTime: 30_000,
  });
}

// ─── Offers ──────────────────────────────────────────────────────────────────

type DbOffer = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  long_desc_ar: string;
  long_desc_en: string;
  main_image: string;
  regular_price: number;
  max_quantity: number;
  free_delivery: boolean;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  offer_gallery: { image_url: string; display_order: number }[];
  offer_includes: { label_ar: string; label_en: string; display_order: number }[];
  offer_perfumes: {
    perfume_id: string | null;
    name_ar: string;
    name_en: string;
    image_url: string;
    desc_ar: string;
    desc_en: string;
    display_order: number;
  }[];
  discounts: {
    is_enabled: boolean;
    old_price: number;
    new_price: number;
    show_countdown: boolean;
    end_date: string | null;
  }[];
};

export type CatalogOffer = Offer & {
  freeDelivery: boolean;
  isVisible: boolean;
  discount?: {
    enabled: boolean;
    oldPrice: number;
    newPrice: number;
    showCountdown: boolean;
    endDate: string | null;
  };
};

export function dbOfferToCatalog(o: DbOffer): CatalogOffer {
  const discountArr = Array.isArray(o.discounts) ? o.discounts : o.discounts ? [o.discounts] : [];
  const discount = discountArr[0];
  const allImages = [
    o.main_image,
    ...o.offer_gallery.sort((a, b) => a.display_order - b.display_order).map((g) => g.image_url),
  ].filter(Boolean);

  return {
    id: o.slug,
    name: { ar: o.title_ar, en: o.title_en },
    description: { ar: o.desc_ar, en: o.desc_en },
    longDescription:
      o.long_desc_ar || o.long_desc_en ? { ar: o.long_desc_ar, en: o.long_desc_en } : undefined,
    images: allImages,
    price: o.regular_price,
    oldPrice: discount?.is_enabled ? discount.old_price : undefined,
    maxQuantity: o.max_quantity,
    freeDelivery: o.free_delivery,
    isVisible: o.is_visible,
    includes: o.offer_includes
      .sort((a, b) => a.display_order - b.display_order)
      .map((inc) => ({ ar: inc.label_ar, en: inc.label_en })),
    perfumes: o.offer_perfumes
      .sort((a, b) => a.display_order - b.display_order)
      .map((p) => ({
        perfumeId: p.perfume_id,
        name: { ar: p.name_ar, en: p.name_en },
        image: p.image_url,
        description: { ar: p.desc_ar, en: p.desc_en },
      })),
    discount: discount
      ? {
          enabled: discount.is_enabled,
          oldPrice: discount.old_price,
          newPrice: discount.new_price,
          showCountdown: discount.show_countdown,
          endDate: discount.end_date,
        }
      : undefined,
  };
}

export function useOffers(visibleOnly = true) {
  return useQuery({
    queryKey: ["offers", visibleOnly],
    queryFn: async () => {
      let q = supabase
        .from("offers")
        .select("*, offer_gallery(*), offer_includes(*), offer_perfumes(*), discounts(*)")
        .order("display_order");
      if (visibleOnly) q = q.eq("is_visible", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data as DbOffer[]).map(dbOfferToCatalog);
    },
    staleTime: 30_000,
  });
}

export function useDiscountedOffers() {
  const { data = [], ...rest } = useOffers(true);
  return {
    ...rest,
    data: data.filter((o) => o.discount?.enabled),
  };
}

// ─── Offer lookup ─────────────────────────────────────────────────────────────

/** The price a customer actually pays for an offer, honouring an active discount. */
export function effectiveOfferPrice(offer: CatalogOffer): number {
  if (offer.discount?.enabled && offer.discount.newPrice > 0) return offer.discount.newPrice;
  return offer.price;
}

/** The struck-through reference price of an offer, when one exists. */
export function referenceOfferPrice(offer: CatalogOffer): number | undefined {
  if (offer.discount?.enabled) return offer.discount.oldPrice;
  return offer.oldPrice;
}

/**
 * Maps a perfume to the first offer that contains it, so a perfume card can show
 * the real Dashboard price instead of an invented one. Perfumes that are not part
 * of any offer simply have no entry.
 *
 * The lookup key accepts either form because `offer_perfumes.perfume_id` stores
 * the `perfumes.id` UUID while a `Perfume` is addressed publicly by its slug.
 */
export function indexOffersByPerfume(offers: CatalogOffer[]): Map<string, CatalogOffer> {
  const index = new Map<string, CatalogOffer>();
  for (const offer of offers) {
    for (const entry of offer.perfumes) {
      if (!entry.perfumeId) continue;
      if (!index.has(entry.perfumeId)) index.set(entry.perfumeId, offer);
    }
  }
  return index;
}

/** Resolves a perfume against the offer index using its UUID, then its slug. */
export function findOfferForPerfume(
  index: Map<string, CatalogOffer>,
  perfume: Perfume,
): CatalogOffer | undefined {
  return (perfume.dbId && index.get(perfume.dbId)) || index.get(perfume.id);
}

// ─── Shared catalogue ─────────────────────────────────────────────────────────

export type CataloguePerfume = {
  perfume: Perfume;
  /** The real offer that gives this perfume a price and an orderable unit. */
  offer?: CatalogOffer;
  price?: number;
  oldPrice?: number;
  isDiscounted: boolean;
};

/**
 * The single catalogue source shared by Home and /perfumes.
 *
 * Both pages call this hook, so they resolve the same React Query keys
 * (`["perfumes", true]` and `["offers", true]`), share one network result and
 * can never drift apart. A product added or edited in the Dashboard appears on
 * both pages automatically.
 *
 * Prices are never fabricated: a perfume only gets a price when the Dashboard
 * links it to an offer, because offers are the only orderable, priced entity in
 * the existing data model.
 */
const EMPTY_PERFUMES: Perfume[] = [];
const EMPTY_OFFERS: CatalogOffer[] = [];

export function useCatalogue(visibleOnly = true) {
  const perfumesQuery = usePerfumes(visibleOnly);
  const offersQuery = useOffers(visibleOnly);

  const perfumes = perfumesQuery.data ?? EMPTY_PERFUMES;
  const offers = offersQuery.data ?? EMPTY_OFFERS;
  const offerIndex = useMemo(() => indexOffersByPerfume(offers), [offers]);

  const items = useMemo<CataloguePerfume[]>(
    () =>
      perfumes.map((perfume) => {
        const offer = findOfferForPerfume(offerIndex, perfume);
        return {
          perfume,
          offer,
          price: offer ? effectiveOfferPrice(offer) : undefined,
          oldPrice: offer ? referenceOfferPrice(offer) : undefined,
          isDiscounted: Boolean(offer?.discount?.enabled),
        };
      }),
    [perfumes, offerIndex],
  );

  return {
    items,
    perfumes,
    offers,
    isPending: perfumesQuery.isPending || offersQuery.isPending,
  };
}

/** Normalises a slug or a URL segment so "Men Collection" and "men-collection" match. */
function offerKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Resolves the `/offers/$offerId` param against the Dashboard-managed offers.
 * The router already decodes params, but raw segments reaching the client
 * (and slugs stored with spaces) are matched on a normalised key so a direct
 * cold load never misses.
 */
export function findOfferByParam(
  offers: CatalogOffer[],
  param: string | undefined,
): CatalogOffer | undefined {
  if (!param) return undefined;
  const raw = safeDecode(param);
  const exact = offers.find((o) => o.id === raw);
  if (exact) return exact;
  const target = offerKey(raw);
  return offers.find((o) => offerKey(o.id) === target);
}

// ─── Contact Settings ─────────────────────────────────────────────────────────

export function useContactSettings() {
  return useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      return data as {
        instagram: string;
        facebook: string;
        tiktok: string;
        telegram: string;
        whatsapp: string;
        email: string;
        phone: string;
        business_hours: string;
      } | null;
    },
    staleTime: 60_000,
  });
}

// ─── Delivery Prices (Supabase) ──────────────────────────────────────────────

export function useDeliveryPrices() {
  return useQuery({
    queryKey: ["delivery-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_prices")
        .select("wilaya_code, home_delivery_price, office_delivery_price, free_delivery");
      if (error) throw error;
      const map: Record<string, { home: number; office: number; freeDelivery: boolean }> = {};
      for (const row of data ?? []) {
        map[row.wilaya_code] = {
          home: row.home_delivery_price,
          office: row.office_delivery_price,
          freeDelivery: row.free_delivery,
        };
      }
      return map;
    },
    staleTime: 60_000,
  });
}
