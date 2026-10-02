import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { CAMPUS_IMAGE, campusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";

/**
 * RAHIQ Campus — the first thing you see on Home.
 *
 * The photograph is the hero: full-bleed, almost one viewport tall, with only
 * two pieces of interface on top of it — a small `NEW` marker and the Campus
 * state. There is deliberately no price, no delivery copy and no marketing
 * paragraph here; 50 DA stays a checkout rule and the residence list stays a
 * checkout step.
 *
 * Activation is the existing URL context (`?campus=1`), not a piece of global
 * state: activating re-renders the same hero as `مفعّل` instead of removing it,
 * and the context then travels with the customer through the catalogue to the
 * order page. Clicking the active pill drops the param and returns to the normal
 * site.
 */
export function CampusHero({ active = false }: { active?: boolean }) {
  const { t } = useI18n();

  return (
    <section className="relative w-full overflow-hidden bg-muted" aria-label={t("campus.name")}>
      <div className="relative min-h-[82svh] w-full sm:min-h-[86svh] lg:min-h-[90svh]">
        <img
          src={CAMPUS_IMAGE}
          alt={t("campus.imageAlt")}
          className="absolute inset-0 h-full w-full object-cover object-[50%_32%] sm:object-center"
          fetchPriority="high"
          decoding="async"
        />

        {/* Legibility only: one short scrim where the `NEW` marker sits. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* The soft fade that lets the photograph dissolve into the page. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-background via-background/55 to-transparent sm:h-72"
          aria-hidden="true"
        />

        <span className="absolute start-4 top-4 rounded-full border border-white/40 bg-black/25 px-2.5 py-1 text-[0.58rem] font-bold leading-none tracking-[0.2em] text-white backdrop-blur-[2px] sm:start-6 sm:top-6">
          NEW
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-6 sm:px-8 sm:pb-9">
          <span className="pb-1 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-white/75 drop-shadow-sm">
            {t("campus.name")}
          </span>

          <Link
            to="/"
            search={active ? undefined : campusSearch(true)}
            replace
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.65rem] font-bold tracking-[0.1em] backdrop-blur-sm transition-colors",
              active
                ? "border border-primary/70 bg-primary/25 text-primary"
                : "border border-white/40 bg-black/25 text-white hover:bg-black/40",
            )}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              {active && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 motion-safe:animate-ping" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  active ? "bg-primary" : "bg-white/70",
                )}
              />
            </span>
            {active ? t("campus.active") : t("campus.activate")}
          </Link>
        </div>
      </div>
    </section>
  );
}
