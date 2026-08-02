import { Link } from "@tanstack/react-router";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { PriceTag } from "@/components/PriceTag";
import { cn } from "@/lib/utils";
import type { Offer } from "@/lib/catalog";

type OfferWithDiscount = Offer & {
  freeDelivery?: boolean;
  discount?: { enabled: boolean; newPrice: number; oldPrice: number; showCountdown?: boolean };
};

function effectivePrice(offer: OfferWithDiscount) {
  if (offer.discount?.enabled && offer.discount.newPrice > 0) return offer.discount.newPrice;
  return offer.price;
}

function getOldPrice(offer: OfferWithDiscount) {
  if (offer.discount?.enabled) return offer.discount.oldPrice;
  return offer.oldPrice;
}

/**
 * A clickable offer/discount card: image, name, short description, price,
 * and a visible "Order" button. For discounts, oldPrice is shown struck-through,
 * a discount badge appears, and a countdown placeholder slot is rendered.
 */
export function OfferCard({
  offer,
  withCountdown = false,
}: {
  offer: OfferWithDiscount;
  withCountdown?: boolean;
}) {
  const localize = useLocalized();
  const { t } = useI18n();
  const name = localize(offer.name);
  const description = localize(offer.description);
  const price = effectivePrice(offer);
  const oldP = getOldPrice(offer);

  const discountPct =
    oldP != null && oldP > price ? Math.round(((oldP - price) / oldP) * 100) : 0;

  return (
    <Link
      to="/offers/$offerId"
      params={{ offerId: offer.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_10px_40px_-26px_oklch(0.145_0_0/0.6)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={offer.images[0]}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {discountPct > 0 && (
          <span className="absolute start-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-[0.08em] text-primary-foreground shadow-sm">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5 text-center">
        <h2 className="text-lg font-bold tracking-[0.08em] text-card-foreground">
          {name}
        </h2>

        <span
          className={cn(
            "mx-auto mt-3 block h-px w-8 bg-primary/40 transition-all duration-500 group-hover:w-14",
          )}
          aria-hidden="true"
        />

        <p className="mt-3 flex-1 text-base font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-4">
          <PriceTag
            price={price}
            oldPrice={oldP}
            className="justify-center"
          />
        </div>

        {withCountdown && (
          <div className="mt-4 rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2.5">
            <span className="block text-sm font-normal tracking-[0.12em] text-muted-foreground">
              00 : 00 : 00
            </span>
          </div>
        )}

        <span className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold tracking-[0.12em] text-primary-foreground transition-all duration-300 group-hover:opacity-90">
          {t("offers.cta")}
        </span>
      </div>
    </Link>
  );
}
