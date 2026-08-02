/**
 * Shared Supabase data hooks consumed by both public pages and admin.
 * Replaces the localStorage admin-store for all data reads.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Perfume, Offer } from "@/lib/catalog";

// ─── Perfumes ─────────────────────────────────────────────────────────────────

type DbPerfume = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  main_image: string;
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

function dbPerfumeToCatalog(p: DbPerfume): Perfume {
  return {
    id: p.slug,
    name: { ar: p.name_ar, en: p.name_en },
    image: p.main_image,
    badges: p.perfume_versions
      .sort((a, b) => a.display_order - b.display_order)
      .map((v) => v.label_en.toLowerCase().replace(/\s+/g, "") as any),
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
      let q = supabase
        .from("perfumes")
        .select("*, perfume_versions(*)")
        .order("display_order");
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
  offer_perfumes: { name_ar: string; name_en: string; image_url: string; desc_ar: string; desc_en: string; display_order: number }[];
  discounts: { is_enabled: boolean; old_price: number; new_price: number; show_countdown: boolean; end_date: string | null }[];
};

export function dbOfferToCatalog(o: DbOffer): Offer & {
  freeDelivery: boolean;
  isVisible: boolean;
  discount?: { enabled: boolean; oldPrice: number; newPrice: number; showCountdown: boolean; endDate: string | null };
} {
  const discount = o.discounts?.[0];
  const allImages = [
    o.main_image,
    ...o.offer_gallery.sort((a, b) => a.display_order - b.display_order).map((g) => g.image_url),
  ].filter(Boolean);

  return {
    id: o.slug,
    name: { ar: o.title_ar, en: o.title_en },
    description: { ar: o.desc_ar, en: o.desc_en },
    longDescription: o.long_desc_ar || o.long_desc_en
      ? { ar: o.long_desc_ar, en: o.long_desc_en }
      : undefined,
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

// ─── Contact Settings ─────────────────────────────────────────────────────────

export function useContactSettings() {
  return useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_settings").select("*").eq("id", 1).maybeSingle();
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
