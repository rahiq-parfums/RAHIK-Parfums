import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type React from "react";

export type Language = "ar" | "en";

export const STORAGE_KEY = "rahiq-lang";

/** The official brand name — the only bilingual text on the website. */
export const BRAND_NAME = "RAHIQ Parfums | رحيق";

type Dict = Record<string, string>;

/**
 * Manual translations only — no automatic translation.
 * Strict language isolation: the Arabic dictionary contains no inline English.
 */
const translations: Record<Language, Dict> = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.perfumes": "العطور",
    "nav.offers": "العروض",
    "nav.discounts": "التخفيضات",
    "nav.contact": "تواصل",
    "lang.switch": "English",
    "lang.label": "اللغة",

    "home.intro":
      "دار عطور جزائرية تختار القليل وتقدّمه بعناية. تشكيلات محدودة، روائح صافية، وتجربة هادئة تليق بالذوق الرفيع.",
    "home.card.perfumes.title": "العطور",
    "home.card.perfumes.text": "تشكيلة مختارة من العطور الفاخرة.",
    "home.card.perfumes.cta": "اكتشف",
    "home.card.offers.title": "العروض",
    "home.card.offers.text": "باقات محدودة تجمع أجمل الاختيارات.",
    "home.card.offers.cta": "اطلب",
    "home.card.discounts.title": "التخفيضات",
    "home.card.discounts.text": "اختيارات مميزة بأسعار خاصة.",
    "home.card.discounts.cta": "اطلب",
    "home.card.action": "اكتشف",

    "perfumes.title": "العطور",
    "perfumes.intro": "تشكيلة مختارة من عطور الدار، تُقدّم للاكتشاف والتأمل.",
    "perfumes.item": "عطر",
    "perfumes.placeholder": "وصف مختصر للعطر يُضاف لاحقًا.",

    "badge.original": "أصلي",
    "badge.ordinary": "عادي",
    "badge.fois2": "مرّتين",
    "badge.fois3": "ثلاث مرّات",

    "rating.title": "تقييم المجتمع",
    "rating.seasons": "الفصول",
    "rating.time": "الوقت",
    "rating.community": "تقييم المجتمع",
    "rating.spring": "الربيع",
    "rating.summer": "الصيف",
    "rating.autumn": "الخريف",
    "rating.winter": "الشتاء",
    "rating.day": "النهار",
    "rating.night": "الليل",
    "rating.reactions": "رأي المجتمع",
    "rating.loved": "أحبوه",
    "rating.liked": "أعجبهم",
    "rating.disliked": "لم يحبوه",

    "offers.title": "العروض",
    "offers.intro": "باقات مختارة تجمع أجمل اختيارات الدار في علبة واحدة.",
    "offers.item": "عرض",
    "offers.placeholder": "وصف مختصر للعرض يُضاف لاحقًا.",
    "offers.viewDetails": "عرض التفاصيل",
    "offers.cta": "اطلب",

    "discounts.title": "التخفيضات",
    "discounts.intro": "اختيارات مميزة بأسعار خاصة لمدة محدودة.",
    "discounts.item": "تخفيض",
    "discounts.placeholder": "وصف مختصر للتخفيض يُضاف لاحقًا.",
    "discounts.endsIn": "ينتهي العرض خلال",
    "discounts.timerPlaceholder": "00 : 00 : 00",

    "offerDetails.included": "ما الذي ستحصل عليه",
    "offerDetails.contents": "محتويات الباقة",
    "offerDetails.perfumes": "العطور المضمّنة في الباقة",
    "offerDetails.orderForm": "نموذج الطلب",
    "offerDetails.orderFormPlaceholder": "سيُضاف نموذج الطلب هنا لاحقًا.",
    "offerDetails.backToOffers": "العودة إلى العروض",

    "card.image": "صورة",
    "card.soon": "قريبًا",

    "contact.title": "تواصل",
    "contact.intro": "نسعد بتواصلكم عبر القنوات الرسمية للدار.",
    "contact.instagram": "إنستغرام",
    "contact.whatsapp": "واتساب",
    "contact.telegram": "تيليغرام",
    "contact.facebook": "فيسبوك",
    "contact.tiktok": "تيك توك",
    "contact.email": "البريد الإلكتروني",

    "footer.rights": "جميع الحقوق محفوظة",

    "order.title": "نموذج الطلب",
    "order.fullName": "الاسم الكامل",
    "order.fullNamePlaceholder": "أدخل اسمك الكامل",
    "order.phone": "رقم الهاتف",
    "order.phonePlaceholder": "06 00 00 00 00",
    "order.wilaya": "الولاية",
    "order.wilayaPlaceholder": "اختر الولاية",
    "order.commune": "البلدية",
    "order.communePlaceholder": "اختر الولاية أولاً",
    "order.communeNotFound": "لم تجد بلديتك؟ اكتبها هنا",
    "order.deliveryType": "نوع التوصيل",
    "order.deliveryHome": "التوصيل إلى المنزل",
    "order.deliveryOffice": "التوصيل إلى المكتب",
    "order.quantity": "الكمية",
    "order.submit": "إرسال الطلب",
    "order.submitNow": "اطلب الآن",
    "order.submitting": "جارٍ الإرسال...",
    "order.success": "تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.",
    "order.error": "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",

    "summary.title": "ملخص الطلب",
    "summary.unitPrice": "سعر الوحدة",
    "summary.quantity": "الكمية",
    "summary.price": "السعر",
    "summary.delivery": "التوصيل",
    "summary.free": "مجاني",
    "summary.total": "المجموع",
    "summary.selectWilaya": "اختر الولاية لحساب التوصيل",

    "admin.title": "لوحة التحكم",
    "admin.dashboard": "لوحة التحكم",
    "admin.products": "المنتجات",
    "admin.offers": "العروض",
    "admin.discounts": "التخفيضات",
    "admin.delivery": "أسعار التوصيل",
    "admin.contact": "روابط التواصل",
    "admin.settings": "الإعدادات",
    "admin.brandSettings": "إعدادات العلامة التجارية",
    "admin.backToSite": "العودة إلى الموقع",

    "admin.brand.logo": "الشعار",
    "admin.brand.logoUrl": "رابط الشعار",
    "admin.brand.name": "اسم العلامة التجارية",
    "admin.brand.heroLogo": "شعار الصفحة الرئيسية",
    "admin.brand.heroLogoUrl": "رابط شعار الصفحة الرئيسية",
    "admin.brand.favicon": "الأيقونة",
    "admin.brand.faviconUrl": "رابط الأيقونة",
    "admin.brand.save": "حفظ",
    "admin.brand.saved": "تم الحفظ",

    "admin.contact.instagram": "إنستغرام",
    "admin.contact.tiktok": "تيك توك",
    "admin.contact.facebook": "فيسبوك",
    "admin.contact.telegram": "تيليغرام",
    "admin.contact.whatsapp": "واتساب",
    "admin.contact.email": "البريد الإلكتروني",
    "admin.contact.save": "حفظ الروابط",
    "admin.contact.saved": "تم حفظ الروابط",

    "admin.products.add": "إضافة منتج",
    "admin.products.edit": "تعديل",
    "admin.products.delete": "حذف",
    "admin.products.name": "الاسم",
    "admin.products.nameAr": "الاسم بالعربية",
    "admin.products.nameEn": "الاسم بالإنجليزية",
    "admin.products.image": "الصورة",
    "admin.products.imageUrl": "رابط الصورة",
    "admin.products.badges": "الإصدارات المتاحة",
    "admin.products.stock": "حالة المخزون",
    "admin.products.inStock": "متوفر",
    "admin.products.outOfStock": "غير متوفر",
    "admin.products.ratings": "التقييمات",
    "admin.products.seasons": "الفصول",
    "admin.products.time": "الوقت",
    "admin.products.save": "حفظ",
    "admin.products.cancel": "إلغاء",
    "admin.products.confirmDelete": "هل أنت متأكد من حذف هذا المنتج؟",

    "admin.offers.add": "إضافة باقة",
    "admin.offers.edit": "تعديل",
    "admin.offers.delete": "حذف",
    "admin.offers.name": "الاسم",
    "admin.offers.nameAr": "الاسم بالعربية",
    "admin.offers.nameEn": "الاسم بالإنجليزية",
    "admin.offers.description": "الوصف",
    "admin.offers.descAr": "الوصف بالعربية",
    "admin.offers.descEn": "الوصف بالإنجليزية",
    "admin.offers.images": "الصور",
    "admin.offers.price": "السعر",
    "admin.offers.maxQuantity": "أقصى كمية",
    "admin.offers.longDescAr": "الوصف الطويل (عربي)",
    "admin.offers.longDescEn": "الوصف الطويل (إنجليزي)",
    "admin.offers.freeDelivery": "توصيل مجاني",
    "admin.offers.save": "حفظ",
    "admin.offers.cancel": "إلغاء",
    "admin.offers.confirmDelete": "هل أنت متأكد من حذف هذه الباقة؟",

    "admin.discounts.enable": "تفعيل التخفيض",
    "admin.discounts.oldPrice": "السعر القديم",
    "admin.discounts.newPrice": "السعر الجديد",
    "admin.discounts.percentage": "نسبة التخفيض",
    "admin.discounts.startDate": "تاريخ البداية",
    "admin.discounts.endDate": "تاريخ النهاية",
    "admin.discounts.status": "الحالة",
    "admin.discounts.active": "مفعّل",
    "admin.discounts.inactive": "غير مفعّل",
    "admin.discounts.save": "حفظ",
    "admin.discounts.noOffers": "لا توجد عروض. أضف عروضًا أولاً.",

    "admin.delivery.wilaya": "الولاية",
    "admin.delivery.home": "التوصيل للمنزل",
    "admin.delivery.office": "التوصيل للمكتب",
    "admin.delivery.free": "توصيل مجاني",
    "admin.delivery.save": "حفظ الأسعار",
    "admin.delivery.saved": "تم حفظ أسعار التوصيل",

    "admin.email.title": "إعدادات البريد الإلكتروني",
    "admin.email.smtpHost": "خادم SMTP",
    "admin.email.smtpPort": "منفذ SMTP",
    "admin.email.smtpEmail": "بريد SMTP",
    "admin.email.smtpPassword": "كلمة مرور SMTP",
    "admin.email.recipientEmail": "البريد المستقبل للطلبات",
    "admin.email.save": "حفظ الإعدادات",
    "admin.email.saved": "تم حفظ إعدادات البريد",
  },
  en: {
    "nav.home": "Home",
    "nav.perfumes": "Perfumes",
    "nav.offers": "Offers",
    "nav.discounts": "Discounts",
    "nav.contact": "Contact",
    "lang.switch": "العربية",
    "lang.label": "Language",

    "home.intro":
      "An Algerian perfume house that chooses few and presents them with care. Limited collections, clear compositions, and a calm experience.",
    "home.card.perfumes.title": "Perfumes",
    "home.card.perfumes.text": "A curated selection of refined fragrances.",
    "home.card.perfumes.cta": "Discover",
    "home.card.offers.title": "Offers",
    "home.card.offers.text": "Limited sets bringing together our finest picks.",
    "home.card.offers.cta": "Order",
    "home.card.discounts.title": "Discounts",
    "home.card.discounts.text": "Selected pieces at special prices.",
    "home.card.discounts.cta": "Order",
    "home.card.action": "Discover",

    "perfumes.title": "Perfumes",
    "perfumes.intro": "A curated selection of the house fragrances, presented for discovery and contemplation.",
    "perfumes.item": "Perfume",
    "perfumes.placeholder": "A short fragrance description will be added later.",

    "badge.original": "Original",
    "badge.ordinary": "Ordinary",
    "badge.fois2": "Fois 2",
    "badge.fois3": "Fois 3",

    "rating.title": "Community Rating",
    "rating.seasons": "Seasons",
    "rating.time": "Time",
    "rating.community": "Community Rating",
    "rating.spring": "Spring",
    "rating.summer": "Summer",
    "rating.autumn": "Autumn",
    "rating.winter": "Winter",
    "rating.day": "Day",
    "rating.night": "Night",
    "rating.reactions": "Community Verdict",
    "rating.loved": "Loved it",
    "rating.liked": "Liked it",
    "rating.disliked": "Didn't like it",

    "offers.title": "Offers",
    "offers.intro": "Curated sets bringing together the finest picks of the house in one box.",
    "offers.item": "Offer",
    "offers.placeholder": "A short offer description will be added later.",
    "offers.viewDetails": "View details",
    "offers.cta": "Order",

    "discounts.title": "Discounts",
    "discounts.intro": "Selected pieces at special prices for a limited time.",
    "discounts.item": "Discount",
    "discounts.placeholder": "A short discount description will be added later.",
    "discounts.endsIn": "Offer ends in",
    "discounts.timerPlaceholder": "00 : 00 : 00",

    "offerDetails.included": "What you will receive",
    "offerDetails.contents": "Package Contents",
    "offerDetails.perfumes": "Fragrances included in the set",
    "offerDetails.orderForm": "Order Form",
    "offerDetails.orderFormPlaceholder": "The order form will be added here later.",
    "offerDetails.backToOffers": "Back to offers",

    "card.image": "Image",
    "card.soon": "Soon",

    "contact.title": "Contact",
    "contact.intro": "We welcome your messages through the official channels of the house.",
    "contact.instagram": "Instagram",
    "contact.whatsapp": "WhatsApp",
    "contact.telegram": "Telegram",
    "contact.facebook": "Facebook",
    "contact.tiktok": "TikTok",
    "contact.email": "Email",

    "footer.rights": "All Rights Reserved",

    "order.title": "Order Form",
    "order.fullName": "Full Name",
    "order.fullNamePlaceholder": "Enter your full name",
    "order.phone": "Phone Number",
    "order.phonePlaceholder": "06 00 00 00 00",
    "order.wilaya": "Wilaya",
    "order.wilayaPlaceholder": "Select wilaya",
    "order.commune": "Commune",
    "order.communePlaceholder": "Select a wilaya first",
    "order.communeNotFound": "Commune not found? Enter it manually.",
    "order.deliveryType": "Delivery Type",
    "order.deliveryHome": "Delivery to Home",
    "order.deliveryOffice": "Delivery to Office",
    "order.quantity": "Quantity",
    "order.submit": "Submit Order",
    "order.submitNow": "Order Now",
    "order.submitting": "Sending...",
    "order.success": "Your order has been sent successfully. We will contact you shortly.",
    "order.error": "An error occurred while sending the order. Please try again.",

    "summary.title": "Order Summary",
    "summary.unitPrice": "Unit Price",
    "summary.quantity": "Quantity",
    "summary.price": "Price",
    "summary.delivery": "Delivery",
    "summary.free": "Free",
    "summary.total": "Total",
    "summary.selectWilaya": "Select a wilaya to calculate delivery",

    "admin.title": "Admin Dashboard",
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.offers": "Offers",
    "admin.discounts": "Discounts",
    "admin.delivery": "Delivery Prices",
    "admin.contact": "Contact Links",
    "admin.settings": "Settings",
    "admin.brandSettings": "Brand Settings",
    "admin.backToSite": "Back to site",

    "admin.brand.logo": "Logo",
    "admin.brand.logoUrl": "Logo URL",
    "admin.brand.name": "Brand Name",
    "admin.brand.heroLogo": "Hero Logo",
    "admin.brand.heroLogoUrl": "Hero Logo URL",
    "admin.brand.favicon": "Favicon",
    "admin.brand.faviconUrl": "Favicon URL",
    "admin.brand.save": "Save",
    "admin.brand.saved": "Saved",

    "admin.contact.instagram": "Instagram",
    "admin.contact.tiktok": "TikTok",
    "admin.contact.facebook": "Facebook",
    "admin.contact.telegram": "Telegram",
    "admin.contact.whatsapp": "WhatsApp",
    "admin.contact.email": "Email",
    "admin.contact.save": "Save Links",
    "admin.contact.saved": "Links saved",

    "admin.products.add": "Add Product",
    "admin.products.edit": "Edit",
    "admin.products.delete": "Delete",
    "admin.products.name": "Name",
    "admin.products.nameAr": "Name (Arabic)",
    "admin.products.nameEn": "Name (English)",
    "admin.products.image": "Image",
    "admin.products.imageUrl": "Image URL",
    "admin.products.badges": "Available Versions",
    "admin.products.stock": "Stock Status",
    "admin.products.inStock": "In Stock",
    "admin.products.outOfStock": "Out of Stock",
    "admin.products.ratings": "Community Ratings",
    "admin.products.seasons": "Seasons",
    "admin.products.time": "Time",
    "admin.products.save": "Save",
    "admin.products.cancel": "Cancel",
    "admin.products.confirmDelete": "Are you sure you want to delete this product?",

    "admin.offers.add": "Add Offer",
    "admin.offers.edit": "Edit",
    "admin.offers.delete": "Delete",
    "admin.offers.name": "Name",
    "admin.offers.nameAr": "Name (Arabic)",
    "admin.offers.nameEn": "Name (English)",
    "admin.offers.description": "Description",
    "admin.offers.descAr": "Description (Arabic)",
    "admin.offers.descEn": "Description (English)",
    "admin.offers.images": "Images",
    "admin.offers.price": "Price",
    "admin.offers.maxQuantity": "Max Quantity",
    "admin.offers.longDescAr": "Long Description (Arabic)",
    "admin.offers.longDescEn": "Long Description (English)",
    "admin.offers.freeDelivery": "Free Delivery",
    "admin.offers.save": "Save",
    "admin.offers.cancel": "Cancel",
    "admin.offers.confirmDelete": "Are you sure you want to delete this offer?",

    "admin.discounts.enable": "Enable Discount",
    "admin.discounts.oldPrice": "Old Price",
    "admin.discounts.newPrice": "New Price",
    "admin.discounts.percentage": "Discount Percentage",
    "admin.discounts.startDate": "Start Date",
    "admin.discounts.endDate": "End Date",
    "admin.discounts.status": "Status",
    "admin.discounts.active": "Active",
    "admin.discounts.inactive": "Inactive",
    "admin.discounts.save": "Save",
    "admin.discounts.noOffers": "No offers available. Add offers first.",

    "admin.delivery.wilaya": "Wilaya",
    "admin.delivery.home": "Home Delivery",
    "admin.delivery.office": "Office Delivery",
    "admin.delivery.free": "Free Delivery",
    "admin.delivery.save": "Save Prices",
    "admin.delivery.saved": "Delivery prices saved",

    "admin.email.title": "Email Settings",
    "admin.email.smtpHost": "SMTP Host",
    "admin.email.smtpPort": "SMTP Port",
    "admin.email.smtpEmail": "SMTP Email",
    "admin.email.smtpPassword": "SMTP Password",
    "admin.email.recipientEmail": "Recipient Email",
    "admin.email.save": "Save Settings",
    "admin.email.saved": "Email settings saved",
  },
};

type I18nValue = {
  lang: Language;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
};

// Keep a single context instance across dev hot-reloads so consumers rendered by
// a not-yet-refreshed provider never see a null context.
const globalScope = globalThis as typeof globalThis & {
  __rahiqI18nContext?: React.Context<I18nValue | null>;
};
const I18nContext =
  globalScope.__rahiqI18nContext ??
  (globalScope.__rahiqI18nContext = createContext<I18nValue | null>(null));

// Safe default (Arabic) used if a consumer renders outside the provider.
const fallbackValue: I18nValue = {
  lang: "ar",
  dir: "rtl",
  t: (key: string) => translations.ar[key] ?? key,
  setLang: () => {},
  toggleLang: () => {},
};

export function I18nProvider({ children }: { children: ReactNode }) {
  // Arabic is the default language on first visit.
  const [lang, setLangState] = useState<Language>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir,
      t: (key: string) => translations[lang][key] ?? key,
      setLang,
      toggleLang: () => setLang(lang === "ar" ? "en" : "ar"),
    }),
    [lang, dir, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  return ctx ?? fallbackValue;
}
