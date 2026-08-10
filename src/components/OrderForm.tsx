import { useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useDeliveryPrices } from "@/lib/data";
import { WILAYAS } from "@/lib/algeria";
import { formatPrice } from "@/lib/currency";
import { sendOrderEmail } from "@/lib/email-service";
import { cn } from "@/lib/utils";

type OfferProp = {
  id: string;
  name: { ar: string; en: string };
  price: number;
  freeDelivery: boolean;
  maxQuantity?: number;
  discount?: { enabled: boolean; newPrice: number };
};

function getEffectivePrice(offer: OfferProp) {
  if (offer.discount?.enabled && offer.discount.newPrice > 0) {
    return offer.discount.newPrice;
  }
  return offer.price;
}

export function OrderForm({ offer }: { offer: OfferProp }) {
  const { t, lang } = useI18n();
  const { data: deliveryPricing = {} } = useDeliveryPrices();
  const wilayas = WILAYAS;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [manualCommune, setManualCommune] = useState("");
  const [useManualCommune, setUseManualCommune] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const unitPrice = getEffectivePrice(offer);
  const isFreeDelivery = offer.freeDelivery;
  const maxQty = offer.maxQuantity ?? 99;

  const deliveryPrice = useMemo(() => {
    if (!wilayaCode) return null;
    if (isFreeDelivery) return 0;
    const pricing = deliveryPricing[wilayaCode];
    if (!pricing) return null;
    return deliveryType === "home" ? pricing.home : pricing.office;
  }, [wilayaCode, deliveryType, isFreeDelivery, deliveryPricing]);

  const subtotal = unitPrice * quantity;
  const total = deliveryPrice != null ? subtotal + deliveryPrice : subtotal;

  const selectedWilaya = wilayas.find((w) => w.code === wilayaCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const effectiveCommune = useManualCommune ? manualCommune.trim() : commune;
    if (!fullName || !phone || !wilayaCode || !effectiveCommune) return;

    setSubmitting(true);
    const wilayaLabel = selectedWilaya
      ? lang === "ar"
        ? selectedWilaya.nameAr
        : selectedWilaya.nameEn
      : wilayaCode;

    const order = {
      offerId: offer.id,
      offerName: lang === "ar" ? offer.name.ar : offer.name.en,
      fullName,
      phone,
      wilaya: wilayaLabel,
      commune: effectiveCommune,
      deliveryType: deliveryType === "home" ? t("order.deliveryHome") : t("order.deliveryOffice"),
      quantity,
      unitPrice,
      deliveryPrice: deliveryPrice ?? 0,
      total,
      orderDateTime: new Date().toISOString(),
    };

    const res = await sendOrderEmail(order);
    setSubmitting(false);
    setResult({ ok: res.success, msg: res.success ? t("order.success") : res.message });
    if (res.success) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
      setFullName("");
      setPhone("");
      setManualCommune("");
      setUseManualCommune(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3.5 text-base font-normal text-foreground transition-colors focus:border-primary focus:outline-none";
  const labelClass =
    "mb-2 block text-sm font-normal tracking-[0.08em] text-muted-foreground";
  const selectClass = cn(inputClass, "appearance-none cursor-pointer");

  return (
    <div className="space-y-8">
      <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass} htmlFor="fullName">
            {t("order.fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("order.fullNamePlaceholder")}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            {t("order.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              const formatted = digits.length > 4
                ? digits.slice(0, 4) +
                  (digits.length > 4 ? " " + digits.slice(4, 6) : "") +
                  (digits.length > 6 ? " " + digits.slice(6, 8) : "") +
                  (digits.length > 8 ? " " + digits.slice(8, 10) : "")
                : digits;
              setPhone(formatted.trim());
            }}
            placeholder={t("order.phonePlaceholder")}
            className={inputClass}
            dir="ltr"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="wilaya">
            {t("order.wilaya")}
          </label>
          <select
            id="wilaya"
            required
            value={wilayaCode}
            onChange={(e) => {
              setWilayaCode(e.target.value);
              setCommune("");
              setManualCommune("");
              setUseManualCommune(false);
            }}
            className={selectClass}
          >
            <option value="" disabled>
              {t("order.wilayaPlaceholder")}
            </option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} {lang === "ar" ? w.nameAr : w.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="commune">
            {t("order.commune")}
          </label>
          <select
            id="commune"
            required={!useManualCommune}
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            disabled={!wilayaCode || useManualCommune}
            className={cn(selectClass, (!wilayaCode || useManualCommune) && "opacity-50")}
          >
            <option value="" disabled>
              {t("order.communePlaceholder")}
            </option>
            {selectedWilaya?.communes.map((m) => (
              <option key={m.nameAr} value={lang === "ar" ? m.nameAr : m.nameEn}>
                {lang === "ar" ? m.nameAr : m.nameEn}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setUseManualCommune((v) => !v)}
            className="mt-1.5 text-xs font-normal tracking-[0.04em] text-primary transition-colors hover:text-primary/70"
          >
            {t("order.communeNotFound")}
          </button>
          {useManualCommune && (
            <input
              type="text"
              required
              value={manualCommune}
              onChange={(e) => setManualCommune(e.target.value)}
              placeholder={t("order.communeNotFound")}
              className={cn(selectClass, "mt-2")}
            />
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="deliveryType">
            {t("order.deliveryType")}
          </label>
          <select
            id="deliveryType"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as "home" | "office")}
            className={selectClass}
          >
            <option value="home">{t("order.deliveryHome")}</option>
            <option value="office">{t("order.deliveryOffice")}</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("order.quantity")}</label>
          <div className="inline-flex items-center rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-12 w-12 items-center justify-center text-xl font-normal text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"
              disabled={quantity <= 1}
              aria-label="−"
            >
              −
            </button>
            <span className="min-w-[3.5rem] text-center text-lg font-normal tabular-nums text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="flex h-12 w-12 items-center justify-center text-xl font-normal text-muted-foreground transition-colors hover:text-primary"
              aria-label="+"
              disabled={quantity >= maxQty}
            >
              +
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary px-6 py-5 text-base font-bold tracking-[0.14em] text-primary-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t("order.submitting") : t("order.confirm")}
        </button>
      </form>

      {/* ─── Live Order Summary ─── */}
      <div className="rounded-2xl border border-primary/20 bg-card p-7 shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] sm:p-8">
        <h3 className="text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
          {t("summary.title")}
        </h3>
        <span className="mx-auto mt-5 block h-px w-10 bg-primary/50" aria-hidden="true" />
        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-base font-normal">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span>{t("summary.unitPrice")}</span>
              <span className="text-sm text-border">×</span>
              <span>{quantity}</span>
            </dt>
            <dd className="tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between text-base font-normal">
            <dt className="text-muted-foreground">{t("summary.delivery")}</dt>
            <dd className="tabular-nums text-foreground">
              {deliveryPrice == null
                ? t("summary.selectWilaya")
                : deliveryPrice === 0
                  ? t("summary.free")
                  : formatPrice(deliveryPrice)}
            </dd>
          </div>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between text-base font-normal">
            <dt className="tracking-[0.1em] text-foreground">{t("summary.total")}</dt>
            <dd className="text-2xl font-bold tabular-nums text-primary">
              {formatPrice(total)}
            </dd>
          </div>
        </dl>
      </div>

      {result && (
        <p
          className={cn(
            "mb-28 rounded-lg border px-5 py-4 text-center text-base font-normal sm:mb-32",
            result.ok
              ? "border-primary/30 bg-accent text-accent-foreground"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {result.msg}
        </p>
      )}

      <div ref={bottomRef} />
    </div>
  );
}