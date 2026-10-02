import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/use-localized";
import { formatPrice } from "@/lib/currency";
import { PerfumeStats } from "@/components/PerfumeStats";
import { productCard } from "@/components/product-card";
import { campusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/catalog";

type PerfumeCardPrice = {
  price: number;
  oldPrice?: number;
};

/**
 * A perfume presented exactly like an offer card: image → name → real price →
 * one order action, built from the same `productCard` primitives so the
 * catalogue and the offers read as one shop rather than two designs.
 *
 * The card is a single link to the perfume's **own** order view,
 * `/perfumes/$perfumeId`. It never points at a collection: a perfume that
 * happens to belong to a set is still ordered as itself, because clicking a
 * perfume means the customer wants that perfume.
 *
 * `price` is supplied only when the Dashboard sells this perfume on its own (see
 * `isIndividualOffer`); it is never stretched across a bundle. While a perfume
 * has no individual offer the card shows no price at all rather than a number
 * that would buy something else, and the same `اطلب الآن` action leads to the
 * perfume page, which states the position plainly.
 *
 * `campus` carries the RAHIK Campus context into the order view so a customer
 * who entered through Campus is never asked to select Campus a second time.
 */
export function PerfumeCard({
  perfume,
  price,
  campus = false,
  className,
}: {
  perfume: Perfume;
  price?: PerfumeCardPrice;
  campus?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const localize = useLocalized();
  const name = localize(perfume.name);

  const isReduced = price != null && price.oldPrice != null && price.oldPrice > price.price;
  const rating = perfume.ratings.community;

  return (
    <Link
      to="/perfumes/$perfumeId"
      params={{ perfumeId: perfume.id }}
      search={campusSearch(campus)}
      className={cn(productCard.root, campus && "border-primary/50", className)}
      aria-label={`${name} — ${t("product.order")}`}
    >
      <div className={productCard.media}>
        <img
          src={perfume.image}
          alt={name}
          className={productCard.image}
          loading="lazy"
          decoding="async"
        />
        {rating > 0 && (
          <span
            className={cn(
              productCard.badge,
              productCard.badgeQuiet,
              productCard.badgeStart,
              "flex items-center gap-0.5",
            )}
            title={t("rating.community")}
          >
            <Star className="h-2 w-2 fill-primary text-primary" aria-hidden="true" />
            {rating}
          </span>
        )}
        {isReduced && (
          <span className={cn(productCard.badge, productCard.badgeSolid, productCard.badgeEnd)}>
            -{Math.round(((price.oldPrice! - price.price) / price.oldPrice!) * 100)}%
          </span>
        )}
      </div>

      <div className={productCard.body}>
        <h3 className={cn(productCard.title, "line-clamp-2")}>{name}</h3>

        <div className="mt-2">
          <PerfumeStats ratings={perfume.ratings} />
        </div>

        <div className={cn(productCard.priceRow, !price && "justify-end")}>
          {price && (
            <span className="flex min-w-0 items-baseline gap-1.5">
              <span className={productCard.price}>{formatPrice(price.price)}</span>
              {isReduced && (
                <span className={productCard.oldPrice}>{formatPrice(price.oldPrice!)}</span>
              )}
            </span>
          )}
          <span className={cn(productCard.cta, "shrink-0")} aria-hidden="true">
            {t("product.order")}
          </span>
        </div>
      </div>
    </Link>
  );
}
