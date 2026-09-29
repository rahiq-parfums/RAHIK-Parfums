import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { CAMPUS_IMAGE, CAMPUS_RESIDENCES } from "@/lib/campus";

/**
 * RAHIQ Campus — an editorial campaign block for delivery to university
 * residences. Deliberately restrained: one photograph, one headline, three
 * short facts and a single action.
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
              <Link
                to="/offers"
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("campus.cta")}
              </Link>
              <span className="text-[0.6rem] tracking-[0.12em] text-muted-foreground" dir="ltr">
                {CAMPUS_RESIDENCES.length} RESIDENCES
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
