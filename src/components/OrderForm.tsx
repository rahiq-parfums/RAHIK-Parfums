import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/use-localized";
import { useDeliveryPrices } from "@/lib/data";
import { WILAYAS } from "@/lib/algeria";
import { CAMPUS_DELIVERY_PRICE, CAMPUS_RESIDENCES } from "@/lib/campus";
import { formatPrice } from "@/lib/currency";
import { sendOrderEmail } from "@/lib/email-service";
import { meta } from "@/lib/meta";
import { generateOrderRef, setOrderSuccessState } from "@/lib/order-success";
import { cn } from "@/lib/utils";

type OfferProp = {
  id: string;
  name: { ar: string; en: string };
  price: number;
  freeDelivery: boolean;
  maxQuantity?: number;
  discount?: { enabled: boolean; newPrice: number };
};

import type { DeliveryMode } from "@/lib/email-service-types";

function getEffectivePrice(offer: OfferProp) {
  if (offer.discount?.enabled && offer.discount.newPrice > 0) {
    return offer.discount.newPrice;
  }
  return offer.price;
}

export function OrderForm({
  offer,
  initialDeliveryMode = "normal",
}: {
  offer: OfferProp;
  initialDeliveryMode?: DeliveryMode;
}) {
  const { t, lang } = useI18n();
  const localize = useLocalized();
  const navigate = useNavigate();
  const { data: deliveryPricing = {} } = useDeliveryPrices();
  const wilayas = WILAYAS;
  const checkoutStarted = useRef(false);

  // When the customer arrived through RAHIQ Campus, Campus is already the
  // active delivery mode: the toggle is hidden and the mode is locked, so the
  // customer is never asked to select Campus a second time.
  const campusLocked = initialDeliveryMode === "campus";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialDeliveryMode);
  const [residence, setResidence] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [manualCommune, setManualCommune] = useState("");
  const [useManualCommune, setUseManualCommune] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isCampus = deliveryMode === "campus";

  const unitPrice = getEffectivePrice(offer);
  const isFreeDelivery = offer.freeDelivery;
  const maxQty = offer.maxQuantity ?? 99;

  const deliveryPrice = useMemo(() => {
    if (isCampus) return CAMPUS_DELIVERY_PRICE;
    if (!wilayaCode) return null;
    if (isFreeDelivery) return 0;
    const pricing = deliveryPricing[wilayaCode];
    if (!pricing) return null;
    return deliveryType === "home" ? pricing.home : pricing.office;
  }, [isCampus, wilayaCode, deliveryType, isFreeDelivery, deliveryPricing]);

  const subtotal = unitPrice * quantity;
  const total = deliveryPrice != null ? subtotal + deliveryPrice : subtotal;

  const selectedWilaya = wilayas.find((w) => w.code === wilayaCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const effectiveCommune = useManualCommune ? manualCommune.trim() : commune;
    if (!fullName || !phone) return;
    if (isCampus) {
      if (!residence) return;
    } else if (!wilayaCode || !effectiveCommune) {
      return;
    }

    if (!checkoutStarted.current) {
      checkoutStarted.current = true;
      meta.initiateCheckout({
        contentIds: [offer.id],
        contentName: lang === "ar" ? offer.name.ar : offer.name.en,
        quantity,
        value: total,
      });
    }

    setSubmitting(true);
    const wilayaLabel = selectedWilaya
      ? lang === "ar"
        ? selectedWilaya.nameAr
        : selectedWilaya.nameEn
      : wilayaCode;

    const orderRef = generateOrderRef();

    const order = {
      offerId: offer.id,
      offerName: lang === "ar" ? offer.name.ar : offer.name.en,
      fullName,
      phone,
      wilaya: isCampus ? "" : wilayaLabel,
      commune: isCampus ? "" : effectiveCommune,
      deliveryType: isCampus
        ? t("order.deliveryCampus")
        : deliveryType === "home"
          ? t("order.deliveryHome")
          : t("order.deliveryOffice"),
      deliveryMode,
      residence: isCampus ? residence : undefined,
      quantity,
      unitPrice,
      deliveryPrice: deliveryPrice ?? 0,
      total,
      orderDateTime: new Date().toISOString(),
      orderRef,
    };

    const res = await sendOrderEmail(order);
    setSubmitting(false);

    if (res.success) {
      meta.purchase(
        {
          contentIds: [offer.id],
          contentName: order.offerName,
          numItems: quantity,
          value: total,
        },
        orderRef,
      );

      setOrderSuccessState({
        orderRef,
        offerName: order.offerName,
        quantity,
        unitPrice,
        deliveryPrice: deliveryPrice ?? 0,
        total,
      });

      navigate({ to: "/order-success" });
    } else {
      setResult({ ok: false, msg: res.message });
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3.5 text-base font-normal text-foreground transition-colors focus:border-primary focus:outline-none";
  const labelClass = "mb-2 block text-sm font-normal tracking-[0.08em] text-muted-foreground";
  const selectClass = cn(inputClass, "appearance-none cursor-pointer");

  const modeButtonClass = (active: boolean) =>
    cn(
      "min-w-0 flex-1 rounded-lg border px-3 py-3 text-sm font-normal transition-colors",
      active
        ? "border-primary bg-primary/10 text-foreground"
        : "border-border text-muted-foreground hover:text-foreground",
    );

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
              const formatted =
                digits.length > 4
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
          <span className={labelClass} id="delivery-mode-label">
            {t("order.deliveryMode")}
          </span>
          {campusLocked ? (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-lg border border-primary/50 bg-primary/10 px-4 py-3.5"
            >
              <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {t("order.deliveryCampus")}
              </span>
              <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.1em] text-primary-foreground">
                {t("campus.active")}
              </span>
            </div>
          ) : (
            <div role="radiogroup" aria-labelledby="delivery-mode-label" className="flex gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={!isCampus}
                onClick={() => setDeliveryMode("normal")}
                className={modeButtonClass(!isCampus)}
              >
                {t("order.deliveryStandard")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isCampus}
                onClick={() => setDeliveryMode("campus")}
                className={modeButtonClass(isCampus)}
              >
                {t("order.deliveryCampus")}
              </button>
            </div>
          )}
        </div>

        {isCampus ? (
          <div>
            <label className={labelClass} htmlFor="residence">
              {t("order.residence")}
            </label>
            <select
              id="residence"
              required
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              className={selectClass}
            >
              <option value="" disabled>
                {t("order.residencePlaceholder")}
              </option>
              {CAMPUS_RESIDENCES.map((option) => (
                <option key={option.ar} value={localize(option)}>
                  {localize(option)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
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
          </>
        )}

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
          {isCampus && residence && (
            <div className="flex items-center justify-between gap-4 text-base font-normal">
              <dt className="text-muted-foreground">{t("summary.residence")}</dt>
              <dd className="truncate text-foreground">{residence}</dd>
            </div>
          )}
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
            <dd className="text-2xl font-bold tabular-nums text-primary">{formatPrice(total)}</dd>
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
