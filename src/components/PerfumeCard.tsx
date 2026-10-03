import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/use-localized";
import { formatPrice } from "@/lib/currency";
import { productCard } from "@/components/product-card";
import { campusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/catalog";

/**
 * A perfume presented exactly like an offer card: image → name → real price →
 * one order action, built from the same `productCard` primitives so the
 * catalogue and the offers read as one shop rather than two designs.
 *
 * The card is a single link to the perfume's own order view,
 * `/perfumes/$perfumeId`. Clicking a perfume means the customer wants that
 * perfume, so the card always leads there and never to a collection.
 *
 * The price shown is `perfumes.price`, the perfume's own Dashboard price. A
 * collection price is never used here: it buys a whole set, so it can never
 * stand behind a single perfume. Fragrance statistics are deliberately absent
 * from this card — they live on the perfume page, behind its own control.
 *
 * `campus` carries the RAHIK Campus context into the order view so a customer
 * who entered through Campus is never asked to select Campus a second time.
 */
export function PerfumeCard({
  perfume,
  campus = false,
  className,
}: {
  perfume: Perfume;
  campus?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const localize = useLocalized();
  const name = localize(perfume.name);
  const price = perfume.price;

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
      </div>

      <div className={productCard.body}>
        <h3 className={cn(productCard.title, "line-clamp-2")}>{name}</h3>

        <div className={cn(productCard.priceRow, price == null && "justify-end")}>
          {price != null && <span className={productCard.price}>{formatPrice(price)}</span>}
          <span className={cn(productCard.cta, "shrink-0")} aria-hidden="true">
            {t("product.order")}
          </span>
        </div>
      </div>
    </Link>
  );
}
