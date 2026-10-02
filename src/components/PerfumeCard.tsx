import { Link } from "@tanstack/react-router";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { PerfumeStats } from "@/components/PerfumeStats";
import { productCard } from "@/components/product-card";
import { campusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/catalog";

type PerfumeCardPrice = {
  price: number;
  oldPrice?: number;
  offerId: string;
};

type PerfumeCardCollection = {
  name: { ar: string; en: string };
  offerId: string;
};

/**
 * A compact, mobile-first perfume card that shares its visual language with the
 * offer card: image → name → metadata → real price → one order action.
 *
 * Ordering never over-promises. A perfume is shown as purchasable only when the
 * Dashboard sells it on its own; in that case `price` carries that offer's real
 * price and the button opens that order flow. When the perfume merely belongs to
 * a collection, the collection is the product that can be bought, so the card
 * shows no price and no order button — it names the collection and links to it.
 * A perfume with neither is simply "available at the house".
 *
 * `campus` carries the RAHIQ Campus context into the order page so a customer
 * who entered through Campus does not have to select Campus a second time.
 */
export function PerfumeCard({
  perfume,
  price,
  collection,
  campus = false,
  className,
}: {
  perfume: Perfume;
  price?: PerfumeCardPrice;
  collection?: PerfumeCardCollection;
  campus?: boolean;
  className?: string;
}) {
  const localize = useLocalized();
  const { t, lang } = useI18n();
  const name = localize(perfume.name);

  const versions = perfume.versions.slice(0, 2);
  const extraVersions = perfume.versions.length - versions.length;
  const isReduced = price != null && price.oldPrice != null && price.oldPrice > price.price;

  return (
    <article className={cn(productCard.root, campus && "border-primary/50", className)}>
      <div className={productCard.media}>
        <img
          src={perfume.image}
          alt={name}
          className={productCard.image}
          loading="lazy"
          decoding="async"
        />
        <span
          className={cn(productCard.badge, productCard.badgeQuiet, productCard.badgeStart)}
          title={t("rating.community")}
        >
          {perfume.ratings.community}%
        </span>
        {isReduced && (
          <span className={cn(productCard.badge, productCard.badgeSolid, productCard.badgeEnd)}>
            -{Math.round(((price.oldPrice! - price.price) / price.oldPrice!) * 100)}%
          </span>
        )}
      </div>

      <div className={productCard.body}>
        <h3 className={cn(productCard.title, "line-clamp-2")}>{name}</h3>

        {(versions.length > 0 || extraVersions > 0) && (
          <p
            className={cn(productCard.note, "mt-1")}
            title={perfume.versions.map((v) => (lang === "ar" ? v.ar : v.en)).join(" · ")}
          >
            {versions.map((v) => (lang === "ar" ? v.ar : v.en)).join(" · ")}
            {extraVersions > 0 && ` +${extraVersions}`}
          </p>
        )}

        <div className="mt-2">
          <PerfumeStats ratings={perfume.ratings} />
        </div>

        <div className={productCard.priceRow}>
          {price ? (
            <>
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className={productCard.price}>{formatPrice(price.price)}</span>
                {isReduced && (
                  <span className={productCard.oldPrice}>{formatPrice(price.oldPrice!)}</span>
                )}
              </span>
              <Link
                to="/offers/$offerId"
                params={{ offerId: price.offerId }}
                search={campusSearch(campus)}
                className={productCard.cta}
              >
                {t("product.order")}
              </Link>
            </>
          ) : collection ? (
            <Link
              to="/offers/$offerId"
              params={{ offerId: collection.offerId }}
              search={campusSearch(campus)}
              className={cn(productCard.quiet, "hover:text-foreground hover:underline")}
              title={`${t("perfumes.inCollection")}: ${localize(collection.name)}`}
            >
              {t("perfumes.inCollection")}
            </Link>
          ) : (
            <span className={productCard.quiet}>{t("perfumes.inStock")}</span>
          )}
        </div>
      </div>
    </article>
  );
}
