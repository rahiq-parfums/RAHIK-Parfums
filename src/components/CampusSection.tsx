import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { CAMPUS_DELIVERY_PRICE, CAMPUS_IMAGE, CAMPUS_RESIDENCES, campusSearch } from "@/lib/campus";
import { formatPrice } from "@/lib/currency";

/**
 * RAHIQ Campus — a permanent editorial block for delivery to university
 * residences.
 *
 * This is a promotion, not a modal or a one-time action: the section, the
 * photograph and the "active" state are always rendered and never consumed by
 * a click. The action simply carries the Campus context (`?campus=1`) into the
 * catalogue, so the order page already knows the customer is ordering for a
 * residence and never asks them to pick Campus again.
 */
export function CampusSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6" aria-labelledby="campus-heading">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:min-h-[22rem]">
            <img
              src={CAMPUS_IMAGE}
              alt={t("campus.imageAlt")}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute start-3 top-3 rounded-full border border-primary/70 bg-background/85 px-2.5 py-1 text-[0.6rem] font-bold leading-none tracking-[0.18em] text-primary backdrop-blur-sm">
              NEW
            </span>
          </div>

          <div
            className="flex flex-col justify-center gap-4 p-5 sm:p-7"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span className="text-[0.6rem] font-semibold tracking-[0.22em] text-muted-foreground">
                RAHIQ CAMPUS
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            <div>
              <h2
                id="campus-heading"
                className="text-xl font-bold tracking-[0.02em] text-foreground sm:text-2xl"
              >
                {t("campus.title")}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("campus.text")}</p>
            </div>

            <ul className="space-y-1.5">
              {["campus.point1", "campus.point2", "campus.point3"].map((key) => (
                <li key={key} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {t(key)}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Persistent service state: always on, never toggled by a click. */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.08em] text-primary">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {t("campus.active")}
              </span>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[0.65rem] font-semibold tracking-[0.08em] text-muted-foreground">
                {t("campus.student")}
              </span>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[0.65rem] font-semibold tabular-nums tracking-[0.08em] text-muted-foreground">
                {formatPrice(CAMPUS_DELIVERY_PRICE)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              <Link
                to="/perfumes"
                search={campusSearch(true)}
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("campus.cta")}
              </Link>
              <span className="text-[0.6rem] tracking-[0.12em] text-muted-foreground">
                {CAMPUS_RESIDENCES.length} {t("campus.residences")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
