import { Link } from "@tanstack/react-router";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { PerfumeStats } from "@/components/PerfumeStats";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/catalog";

type PerfumeCardPrice = {
  price: number;
  oldPrice?: number;
  offerId: string;
};

/**
 * A compact, mobile-first perfume card.
 *
 * Hierarchy: image → name → compact community metadata → price → action.
 * The image stays the dominant element; everything below it is compressed into
 * micro-typography and hairline meters so roughly two cards fit in one phone
 * viewport.
 *
 * `price` is optional and only supplied when the Dashboard links this perfume
 * to an offer that carries a real price.
 */
export function PerfumeCard({
  perfume,
  price,
  className,
}: {
  perfume: Perfume;
  price?: PerfumeCardPrice;
  className?: string;
}) {
  const localize = useLocalized();
  const { t, lang } = useI18n();
  const name = localize(perfume.name);

  const versions = perfume.versions.slice(0, 2);
  const extraVersions = perfume.versions.length - versions.length;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/45",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={perfume.image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <span
          className="absolute start-1.5 top-1.5 rounded-full bg-background/90 px-1.5 py-0.5 text-[0.6rem] leading-none font-bold tabular-nums text-foreground backdrop-blur-sm"
          title={t("rating.community")}
        >
          {perfume.ratings.community}%
        </span>
        {price && price.oldPrice != null && price.oldPrice > price.price && (
          <span className="absolute bottom-0 end-0 bg-primary px-1.5 py-0.5 text-[0.6rem] leading-none font-bold text-primary-foreground">
            -{Math.round(((price.oldPrice - price.price) / price.oldPrice) * 100)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="truncate text-[0.8rem] leading-tight font-semibold text-card-foreground">
          {name}
        </h3>

        {(versions.length > 0 || extraVersions > 0) && (
          <p
            className="truncate text-[0.55rem] leading-none tracking-[0.04em] text-muted-foreground"
            title={perfume.versions.map((v) => (lang === "ar" ? v.ar : v.en)).join(" · ")}
          >
            {versions.map((v) => (lang === "ar" ? v.ar : v.en)).join(" · ")}
            {extraVersions > 0 && ` +${extraVersions}`}
          </p>
        )}

        <PerfumeStats ratings={perfume.ratings} />

        <div className="mt-auto flex items-center justify-between gap-1.5 pt-0.5">
          {price ? (
            <span className="flex min-w-0 items-baseline gap-1">
              <span className="truncate text-[0.8rem] font-bold tabular-nums text-primary">
                {formatPrice(price.price)}
              </span>
              {price.oldPrice != null && price.oldPrice > price.price && (
                <span className="shrink-0 text-[0.6rem] tabular-nums text-muted-foreground line-through">
                  {formatPrice(price.oldPrice)}
                </span>
              )}
            </span>
          ) : (
            <span className="truncate text-[0.6rem] tracking-[0.06em] text-muted-foreground">
              {t("perfumes.inStock")}
            </span>
          )}

          {price ? (
            <Link
              to="/offers/$offerId"
              params={{ offerId: price.offerId }}
              className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.04em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("offers.cta")}
            </Link>
          ) : (
            <Link
              to="/perfumes"
              className="shrink-0 rounded-full border border-primary/45 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.04em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t("home.card.action")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
