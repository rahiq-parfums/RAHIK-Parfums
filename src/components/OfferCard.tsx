import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { effectiveOfferPrice, referenceOfferPrice } from "@/lib/data";
import { productCard } from "@/components/product-card";
import { campusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
import type { CatalogOffer } from "@/lib/data";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number } | null;

function useCountdown(endDate: string | null | undefined): TimeLeft {
  const calc = () => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (isNaN(diff) || diff <= 0) return null;
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [left, setLeft] = useState<TimeLeft>(calc);
  useEffect(() => {
    setLeft(calc());
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);
  return left;
}

/**
 * A collection offer presented as a product: image, name, real price, order
 * action — nothing else.
 *
 * An offer is the purchasable entity in the existing data model, so a bundle is
 * shown as one product with its own Dashboard price and never split across the
 * perfumes it contains. The marketing paragraph is deliberately gone: the name
 * says what the product is, and the card uses the same primitives as
 * `PerfumeCard` so the catalogue and the offers read as one shop.
 *
 * `campus` keeps the RAHIQ Campus context alive when an offer is ordered from
 * the Home shelf.
 */
export function OfferCard({
  offer,
  withCountdown = false,
  campus = false,
}: {
  offer: CatalogOffer;
  withCountdown?: boolean;
  campus?: boolean;
}) {
  const localize = useLocalized();
  const { t } = useI18n();
  const name = localize(offer.name);

  const price = effectiveOfferPrice(offer);
  const oldPrice = referenceOfferPrice(offer);
  const isReduced = oldPrice != null && oldPrice > price;

  const showTimer = withCountdown && offer.discount?.showCountdown && offer.discount?.enabled;
  const timeLeft = useCountdown(showTimer ? offer.discount?.endDate : null);

  return (
    <Link
      to="/offers/$offerId"
      params={{ offerId: offer.id }}
      search={campusSearch(campus)}
      className={productCard.root}
    >
      <div className={productCard.media}>
        <img
          src={offer.images[0]}
          alt={name}
          className={productCard.image}
          loading="lazy"
          decoding="async"
        />
        {isReduced && (
          <span className={cn(productCard.badge, productCard.badgeSolid, productCard.badgeStart)}>
            -{Math.round(((oldPrice! - price) / oldPrice!) * 100)}%
          </span>
        )}
      </div>

      <div className={productCard.body}>
        <h2 className={cn(productCard.title, "line-clamp-2")}>{name}</h2>

        {showTimer && timeLeft && (
          <div
            dir="ltr"
            className="mt-2 flex justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-muted/40 px-2 py-2"
          >
            {[
              { value: timeLeft.days, label: t("discounts.timerDays") },
              { value: timeLeft.hours, label: t("discounts.timerHours") },
              { value: timeLeft.minutes, label: t("discounts.timerMinutes") },
              { value: timeLeft.seconds, label: t("discounts.timerSeconds") },
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xs font-semibold tabular-nums tracking-[0.1em] text-foreground">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[0.55rem] tracking-[0.06em] text-muted-foreground">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className={productCard.priceRow}>
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className={productCard.price}>{formatPrice(price)}</span>
            {isReduced && <span className={productCard.oldPrice}>{formatPrice(oldPrice!)}</span>}
          </span>
          <span className={productCard.cta} aria-hidden="true">
            {t("product.order")}
          </span>
        </div>
      </div>
    </Link>
  );
}
