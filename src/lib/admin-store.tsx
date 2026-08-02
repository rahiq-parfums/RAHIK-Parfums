/**
 * Admin store — in-memory + localStorage persistence.
 *
 * This is a lightweight client-side store that holds all editable content:
 * brand settings, contact links, products, offers, discounts, and delivery
 * pricing. It persists to localStorage so changes survive page reloads.
 *
 * In a future phase this can be replaced by Supabase tables without changing
 * the consuming components — they all go through the hooks below.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PERFUMES, OFFERS, type Perfume, type Offer, type BadgeKey, type Bilingual } from "@/lib/catalog";
import { WILAYAS } from "@/lib/algeria";

// ─── Types ──────────────────────────────────────────────────────────────────

export type BrandSettings = {
  logoUrl: string;
  brandName: string;
  heroLogoUrl: string;
  faviconUrl: string;
};

export type ContactLinks = {
  instagram: string;
  tiktok: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  email: string;
};

export type DeliveryPricing = {
  [wilayaCode: string]: { home: number; office: number; freeDelivery: boolean };
};

export type DiscountInfo = {
  enabled: boolean;
  oldPrice: number;
  newPrice: number;
  startDate: string;
  endDate: string;
};

export type AdminOffer = Offer & {
  freeDelivery: boolean;
  discount?: DiscountInfo;
};

export type EmailSettings = {
  smtpHost: string;
  smtpPort: string;
  smtpEmail: string;
  smtpPassword: string;
  recipientEmail: string;
};

export type AdminState = {
  brand: BrandSettings;
  contacts: ContactLinks;
  products: Perfume[];
  offers: AdminOffer[];
  deliveryPricing: DeliveryPricing;
  email: EmailSettings;
};

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_BRAND: BrandSettings = {
  logoUrl: "",
  brandName: "RAHIQ Parfums | رحيق",
  heroLogoUrl: "",
  faviconUrl: "/favicon.svg",
};

const DEFAULT_CONTACTS: ContactLinks = {
  instagram: "https://instagram.com/rahiqparfums",
  tiktok: "https://tiktok.com/@rahiqparfums",
  facebook: "https://facebook.com/rahiqparfums",
  telegram: "https://t.me/rahiqparfums",
  whatsapp: "https://wa.me/213000000000",
  email: "contact@rahiqparfums.dz",
};

function defaultDeliveryPricing(): DeliveryPricing {
  const pricing: DeliveryPricing = {};
  for (const w of WILAYAS) {
    pricing[w.code] = { home: 600, office: 400, freeDelivery: false };
  }
  // Algiers is cheaper
  pricing["16"] = { home: 400, office: 250, freeDelivery: false };
  // South is more expensive
  pricing["11"] = { home: 1000, office: 700, freeDelivery: false };
  pricing["33"] = { home: 1200, office: 800, freeDelivery: false };
  return pricing;
}

function defaultOffers(): AdminOffer[] {
  return OFFERS.map((o) => {
    const isSampleDiscount = o.id === "signature-trio";
    return {
      ...o,
      freeDelivery: false,
      discount: {
        enabled: isSampleDiscount,
        oldPrice: o.price,
        newPrice: isSampleDiscount ? Math.round(o.price * 0.75) : Math.round(o.price * 0.7),
        startDate: isSampleDiscount ? new Date().toISOString() : "",
        endDate: isSampleDiscount
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : "",
      },
    };
  });
}

const DEFAULT_EMAIL: EmailSettings = {
  smtpHost: "YOUR_SMTP_HOST",
  smtpPort: "587",
  smtpEmail: "your-email@example.com",
  smtpPassword: "your-password",
  recipientEmail: "orders@rahiqparfums.dz",
};

const DEFAULT_STATE: AdminState = {
  brand: DEFAULT_BRAND,
  contacts: DEFAULT_CONTACTS,
  products: PERFUMES,
  offers: defaultOffers(),
  deliveryPricing: defaultDeliveryPricing(),
  email: DEFAULT_EMAIL,
};

// ─── Persistence ────────────────────────────────────────────────────────────

const STORAGE_KEY = "rahiq-admin-state";

function loadState(): AdminState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    return {
      brand: { ...DEFAULT_BRAND, ...parsed.brand },
      contacts: { ...DEFAULT_CONTACTS, ...parsed.contacts },
      products: parsed.products ?? DEFAULT_STATE.products,
      offers: parsed.offers ?? DEFAULT_STATE.offers,
      deliveryPricing: parsed.deliveryPricing ?? DEFAULT_STATE.deliveryPricing,
      email: parsed.email ?? DEFAULT_STATE.email,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: AdminState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

type AdminContextValue = {
  state: AdminState;
  updateBrand: (patch: Partial<BrandSettings>) => void;
  updateContacts: (patch: Partial<ContactLinks>) => void;
  addProduct: (product: Perfume) => void;
  updateProduct: (id: string, patch: Partial<Perfume>) => void;
  deleteProduct: (id: string) => void;
  addOffer: (offer: AdminOffer) => void;
  updateOffer: (id: string, patch: Partial<AdminOffer>) => void;
  deleteOffer: (id: string) => void;
  updateDeliveryPricing: (code: string, patch: Partial<DeliveryPricing[string]>) => void;
  updateEmail: (patch: Partial<EmailSettings>) => void;
  resetState: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateBrand = useCallback((patch: Partial<BrandSettings>) => {
    setState((s) => ({ ...s, brand: { ...s.brand, ...patch } }));
  }, []);

  const updateContacts = useCallback((patch: Partial<ContactLinks>) => {
    setState((s) => ({ ...s, contacts: { ...s.contacts, ...patch } }));
  }, []);

  const addProduct = useCallback((product: Perfume) => {
    setState((s) => ({ ...s, products: [...s.products, product] }));
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Perfume>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  }, []);

  const addOffer = useCallback((offer: AdminOffer) => {
    setState((s) => ({ ...s, offers: [...s.offers, offer] }));
  }, []);

  const updateOffer = useCallback((id: string, patch: Partial<AdminOffer>) => {
    setState((s) => ({
      ...s,
      offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState((s) => ({ ...s, offers: s.offers.filter((o) => o.id !== id) }));
  }, []);

  const updateDeliveryPricing = useCallback(
    (code: string, patch: Partial<DeliveryPricing[string]>) => {
      setState((s) => ({
        ...s,
        deliveryPricing: {
          ...s.deliveryPricing,
          [code]: { ...s.deliveryPricing[code], ...patch },
        },
      }));
    },
    [],
  );

  const updateEmail = useCallback((patch: Partial<EmailSettings>) => {
    setState((s) => ({ ...s, email: { ...s.email, ...patch } }));
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      state,
      updateBrand,
      updateContacts,
      addProduct,
      updateProduct,
      deleteProduct,
      addOffer,
      updateOffer,
      deleteOffer,
      updateDeliveryPricing,
      updateEmail,
      resetState,
    }),
    [state, updateBrand, updateContacts, addProduct, updateProduct, deleteProduct, addOffer, updateOffer, deleteOffer, updateDeliveryPricing, updateEmail, resetState],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

// ─── Selectors ──────────────────────────────────────────────────────────────

/** Returns the offers that have a discount enabled — for the public Discounts page. */
export function selectDiscountedOffers(offers: AdminOffer[]): AdminOffer[] {
  return offers.filter((o) => o.discount?.enabled);
}

/** Returns the effective price for an offer (discounted if enabled). */
export function effectivePrice(offer: AdminOffer): number {
  if (offer.discount?.enabled && offer.discount.newPrice > 0) {
    return offer.discount.newPrice;
  }
  return offer.price;
}

/** Returns the old price for an offer (for strikethrough display). */
export function oldPrice(offer: AdminOffer): number | undefined {
  if (offer.discount?.enabled) return offer.discount.oldPrice;
  return offer.oldPrice;
}

export type { Perfume, Offer, BadgeKey, Bilingual };
