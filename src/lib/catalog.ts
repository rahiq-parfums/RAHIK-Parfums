/**
 * Phase 3 placeholder catalogue.
 *
 * All content here is realistic placeholder data used only to visualise the
 * premium experience. No backend, no shopping logic — pure UI.
 *
 * Bilingual fields are stored as `{ ar, en }` and resolved through `useI18n`.
 */

export type Bilingual = { ar: string; en: string };

export type BadgeKey = "original" | "ordinary" | "fois2" | "fois3";

export type Perfume = {
  id: string;
  name: Bilingual;
  image: string;
  badges: BadgeKey[];
  ratings: {
    seasons: { spring: number; summer: number; autumn: number; winter: number };
    time: { day: number; night: number };
    community: number;
    reactions: { loved: number; liked: number; disliked: number };
  };
};

export type Offer = {
  id: string;
  name: Bilingual;
  description: Bilingual;
  longDescription?: Bilingual;
  images: string[];
  price: number;
  oldPrice?: number;
  maxQuantity?: number;
  includes: Bilingual[];
  perfumes: { name: Bilingual; image: string; description: Bilingual }[];
};

const PERFUME_IMAGES = [
  "https://images.pexels.com/photos/7364096/pexels-photo-7364096.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/11122042/pexels-photo-11122042.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/16266295/pexels-photo-16266295.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/20419734/pexels-photo-20419734.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/27357173/pexels-photo-27357173.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/32630384/pexels-photo-32630384.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/7702669/pexels-photo-7702669.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/21308575/pexels-photo-21308575.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/37468240/pexels-photo-37468240.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  "https://images.pexels.com/photos/11711808/pexels-photo-11711808.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
];

export const PERFUMES: Perfume[] = [
  {
    id: "oud-royal",
    name: { ar: "عود رويال", en: "Oud Royal" },
    image: PERFUME_IMAGES[0],
    badges: ["original", "fois2"],
    ratings: {
      seasons: { spring: 55, summer: 35, autumn: 82, winter: 95 },
      time: { day: 40, night: 94 },
      community: 93,
      reactions: { loved: 78, liked: 18, disliked: 4 },
    },
  },
  {
    id: "musk-velvet",
    name: { ar: "مسك فيلفيت", en: "Musk Velvet" },
    image: PERFUME_IMAGES[1],
    badges: ["original", "ordinary"],
    ratings: {
      seasons: { spring: 78, summer: 60, autumn: 70, winter: 88 },
      time: { day: 72, night: 80 },
      community: 89,
      reactions: { loved: 70, liked: 24, disliked: 6 },
    },
  },
  {
    id: "amber-nuit",
    name: { ar: "أمبر نوي", en: "Amber Nuit" },
    image: PERFUME_IMAGES[2],
    badges: ["original", "fois3"],
    ratings: {
      seasons: { spring: 48, summer: 30, autumn: 76, winter: 92 },
      time: { day: 35, night: 96 },
      community: 91,
      reactions: { loved: 74, liked: 20, disliked: 6 },
    },
  },
  {
    id: "rose-saffron",
    name: { ar: "ورد و زعفران", en: "Rose Saffron" },
    image: PERFUME_IMAGES[3],
    badges: ["original", "fois2", "ordinary"],
    ratings: {
      seasons: { spring: 90, summer: 50, autumn: 78, winter: 60 },
      time: { day: 85, night: 70 },
      community: 94,
      reactions: { loved: 82, liked: 14, disliked: 4 },
    },
  },
  {
    id: "blanc-absolu",
    name: { ar: "بلان أبسولو", en: "Blanc Absolu" },
    image: PERFUME_IMAGES[4],
    badges: ["original"],
    ratings: {
      seasons: { spring: 88, summer: 92, autumn: 55, winter: 40 },
      time: { day: 95, night: 50 },
      community: 87,
      reactions: { loved: 64, liked: 28, disliked: 8 },
    },
  },
  {
    id: "noir-eternal",
    name: { ar: "نوار إيترنال", en: "Noir Eternal" },
    image: PERFUME_IMAGES[5],
    badges: ["original", "fois2"],
    ratings: {
      seasons: { spring: 45, summer: 38, autumn: 80, winter: 96 },
      time: { day: 42, night: 97 },
      community: 95,
      reactions: { loved: 84, liked: 13, disliked: 3 },
    },
  },
  {
    id: "fleur-dor",
    name: { ar: "فleur دور", en: "Fleur d'Or" },
    image: PERFUME_IMAGES[6],
    badges: ["original", "ordinary"],
    ratings: {
      seasons: { spring: 92, summer: 65, autumn: 72, winter: 55 },
      time: { day: 80, night: 74 },
      community: 88,
      reactions: { loved: 66, liked: 26, disliked: 8 },
    },
  },
  {
    id: "santal-pure",
    name: { ar: "صندل بيور", en: "Santal Pure" },
    image: PERFUME_IMAGES[7],
    badges: ["original", "fois3"],
    ratings: {
      seasons: { spring: 60, summer: 45, autumn: 85, winter: 90 },
      time: { day: 55, night: 89 },
      community: 90,
      reactions: { loved: 72, liked: 22, disliked: 6 },
    },
  },
  {
    id: "jasmin-royale",
    name: { ar: "ياسمين رويال", en: "Jasmin Royale" },
    image: PERFUME_IMAGES[8],
    badges: ["original", "fois2"],
    ratings: {
      seasons: { spring: 95, summer: 70, autumn: 60, winter: 48 },
      time: { day: 88, night: 66 },
      community: 92,
      reactions: { loved: 76, liked: 19, disliked: 5 },
    },
  },
  {
    id: "cuir-noir",
    name: { ar: "كوير نوار", en: "Cuir Noir" },
    image: PERFUME_IMAGES[9],
    badges: ["original", "ordinary", "fois3"],
    ratings: {
      seasons: { spring: 40, summer: 32, autumn: 78, winter: 94 },
      time: { day: 38, night: 93 },
      community: 89,
      reactions: { loved: 68, liked: 24, disliked: 8 },
    },
  },
];

const PACKAGE_IMAGES = [
  [
    "https://images.pexels.com/photos/36482359/pexels-photo-36482359.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/18833913/pexels-photo-18833913.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/15737946/pexels-photo-15737946.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  ],
  [
    "https://images.pexels.com/photos/34144841/pexels-photo-34144841.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/34051690/pexels-photo-34051690.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/10199016/pexels-photo-10199016.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  ],
  [
    "https://images.pexels.com/photos/12053220/pexels-photo-12053220.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/15237858/pexels-photo-15237858.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/16057237/pexels-photo-16057237.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  ],
  [
    "https://images.pexels.com/photos/965990/pexels-photo-965990.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/8624586/pexels-photo-8624586.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
    "https://images.pexels.com/photos/36698796/pexels-photo-36698796.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  ],
];

export const OFFERS: Offer[] = [
  {
    id: "signature-trio",
    name: { ar: "باقة التوقيع الثلاثية", en: "Signature Trio" },
    description: {
      ar: "ثلاثة عطور مختارة تجمع بين الدفء والنقاء، في علبة فاخرة تصلح للإهداء.",
      en: "Three curated fragrances blending warmth and clarity, in a luxurious gift box.",
    },
    images: PACKAGE_IMAGES[0],
    price: 14500,
    includes: [
      { ar: "ثلاث زجاجات عطر 50 مل", en: "Three 50ml fragrance bottles" },
      { ar: "علبة هدايا فاخرة مع شريط", en: "Luxury gift box with ribbon" },
      { ar: "بطاقة إهداء مكتوبة بخط اليد", en: "Handwritten gift card" },
    ],
    perfumes: [
      {
        name: { ar: "عود رويال", en: "Oud Royal" },
        image: PERFUME_IMAGES[0],
        description: { ar: "عود دافئ بلمسة شرقية عميقة.", en: "Warm oud with a deep oriental touch." },
      },
      {
        name: { ar: "ورد و زعفران", en: "Rose Saffron" },
        image: PERFUME_IMAGES[3],
        description: { ar: "ورد دمشقي مع خيوط الزعفران.", en: "Damascus rose with saffron threads." },
      },
      {
        name: { ar: "أمبر نوي", en: "Amber Nuit" },
        image: PERFUME_IMAGES[2],
        description: { ar: "أمبر ليلي بنفحات الفانيليا.", en: "Nightly amber with vanilla nuances." },
      },
    ],
  },
  {
    id: "discovery-set",
    name: { ar: "مجموعة الاكتشاف", en: "Discovery Set" },
    description: {
      ar: "خمس عينات صغيرة لاستكشاف تشكيلة الدار قبل اختيار العطر الكامل.",
      en: "Five small samples to explore the house collection before choosing a full fragrance.",
    },
    images: PACKAGE_IMAGES[1],
    price: 6200,
    includes: [
      { ar: "خمس عينات عطر 10 مل", en: "Five 10ml fragrance samples" },
      { ar: "محفظة جلدية أنيقة", en: "Elegant leather pouch" },
      { ar: "دليل العطور التعريفي", en: "Introductory fragrance guide" },
    ],
    perfumes: [
      {
        name: { ar: "بلان أبسولو", en: "Blanc Absolu" },
        image: PERFUME_IMAGES[4],
        description: { ar: "نقاء أبيض بنفحات الحمضيات.", en: "White purity with citrus nuances." },
      },
      {
        name: { ar: "فleur دور", en: "Fleur d'Or" },
        image: PERFUME_IMAGES[6],
        description: { ar: "زهرة ذهبية مشمسة.", en: "Sun-kissed golden flower." },
      },
      {
        name: { ar: "ياسمين رويال", en: "Jasmin Royale" },
        image: PERFUME_IMAGES[8],
        description: { ar: "ياسمين ربيعي ناعم.", en: "Soft spring jasmine." },
      },
    ],
  },
  {
    id: "royal-pair",
    name: { ar: "الثنائي الملكي", en: "Royal Pair" },
    description: {
      ar: "عطران متناقضان في علبة مزدوجة أنيقة، للنهار والليل.",
      en: "Two contrasting fragrances in an elegant double box, for day and night.",
    },
    images: PACKAGE_IMAGES[2],
    price: 9800,
    includes: [
      { ar: "زجاجتان عطر 75 مل", en: "Two 75ml fragrance bottles" },
      { ar: "علبة مزدوجة فاخرة", en: "Luxury double box" },
      { ar: "بطاقة معلومات العطور", en: "Fragrance information card" },
    ],
    perfumes: [
      {
        name: { ar: "بلان أبسولو", en: "Blanc Absolu" },
        image: PERFUME_IMAGES[4],
        description: { ar: "نقاء أبيض للنهار.", en: "White purity for the day." },
      },
      {
        name: { ar: "نوار إيترنال", en: "Noir Eternal" },
        image: PERFUME_IMAGES[5],
        description: { ar: "سواد دائم لليل.", en: "Eternal black for the night." },
      },
    ],
  },
  {
    id: "oud-collection",
    name: { ar: "مجموعة العود", en: "Oud Collection" },
    description: {
      ar: "أربعة عطور عودية نادرة في صندوق خشبي فاخر مخصص للدار.",
      en: "Four rare oud fragrances in a wooden box exclusive to the house.",
    },
    images: PACKAGE_IMAGES[3],
    price: 22000,
    includes: [
      { ar: "أربع زجاجات عطر 50 مل", en: "Four 50ml fragrance bottles" },
      { ar: "صندوق خشبي فاخر محفور", en: "Engraved luxury wooden box" },
      { ar: "شهادة أصالة الدار", en: "House authenticity certificate" },
    ],
    perfumes: [
      {
        name: { ar: "عود رويال", en: "Oud Royal" },
        image: PERFUME_IMAGES[0],
        description: { ar: "عود ملكي دافئ.", en: "Warm royal oud." },
      },
      {
        name: { ar: "أمبر نوي", en: "Amber Nuit" },
        image: PERFUME_IMAGES[2],
        description: { ar: "أمبر ليلي فاخر.", en: "Luxurious night amber." },
      },
      {
        name: { ar: "صندل بيور", en: "Santal Pure" },
        image: PERFUME_IMAGES[7],
        description: { ar: "صندل نقي هادئ.", en: "Calm pure sandalwood." },
      },
    ],
  },
];

/** Discounts reuse offer-style data with an old price + countdown placeholder. */
export const DISCOUNTS: Offer[] = OFFERS.map((offer, i) => ({
  ...offer,
  id: `${offer.id}-promo`,
  oldPrice: offer.price,
  price: Math.round(offer.price * (i % 2 === 0 ? 0.7 : 0.6)),
}));

export function findOffer(id: string): Offer | undefined {
  return OFFERS.find((o) => o.id === id);
}
