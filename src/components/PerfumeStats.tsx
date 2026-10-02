import { Sun, Moon, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Perfume } from "@/lib/catalog";

/**
 * Compact, Fragrantica-inspired fragrance information.
 *
 * The concept is borrowed — "when and how is this worn, at a glance" — but
 * nothing is copied: no branding, no layout, no colour scheme. RAHIQ gold stays
 * the only accent, and each season gets a low-saturation tint so the four bars
 * are told apart without turning the card into a rainbow.
 *
 * Every number is a real Dashboard column (`rating_*`, `community_score`),
 * rendered as-is: no rescaling, no invented averages, no fabricated score. The
 * whole strip is deliberately kept to a few lines of text and two hairline bars
 * so it reads as an information sliver rather than a statistics dashboard.
 */
export function PerfumeStats({
  ratings,
  showRating = false,
}: {
  ratings: Perfume["ratings"];
  /** The card shows the community score as a media badge, so it opts out here. */
  showRating?: boolean;
}) {
  const { t } = useI18n();

  const seasons = [
    {
      key: "spring",
      label: t("rating.spring"),
      value: ratings.seasons.spring,
      color: "bg-emerald-600/55",
    },
    {
      key: "summer",
      label: t("rating.summer"),
      value: ratings.seasons.summer,
      color: "bg-amber-500/70",
    },
    {
      key: "autumn",
      label: t("rating.autumn"),
      value: ratings.seasons.autumn,
      color: "bg-orange-700/55",
    },
    {
      key: "winter",
      label: t("rating.winter"),
      value: ratings.seasons.winter,
      color: "bg-sky-600/55",
    },
  ];

  const day = Math.max(0, Math.min(100, ratings.time.day));
  const night = Math.max(0, Math.min(100, ratings.time.night));
  const total = day + night || 1;
  const dayPct = Math.round((day / total) * 100);
  const nightPct = 100 - dayPct;

  return (
    <div className="space-y-1.5">
      {showRating && ratings.community > 0 && (
        <div className="flex items-center gap-1">
          <Star className="h-2.5 w-2.5 fill-primary text-primary" aria-hidden="true" />
          <span className="text-[0.6rem] font-bold leading-none tabular-nums text-foreground">
            {ratings.community}
          </span>
          <span className="truncate text-[0.5rem] leading-none tracking-[0.04em] text-muted-foreground">
            {t("rating.community")}
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1">
        {seasons.map((season) => (
          <div key={season.key} className="min-w-0" title={`${season.label} ${season.value}%`}>
            <span className="block truncate text-[0.5rem] leading-tight tracking-[0.04em] text-muted-foreground">
              {season.label}
            </span>
            <span className="mt-0.5 block h-px w-full overflow-hidden bg-border">
              <span
                className={cn("block h-full", season.color)}
                style={{ width: `${Math.max(0, Math.min(100, season.value))}%` }}
              />
            </span>
            <span className="mt-0.5 block text-[0.55rem] leading-none tabular-nums text-foreground/75">
              {season.value}%
            </span>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-1.5"
        title={`${t("rating.day")} ${dayPct}% · ${t("rating.night")} ${nightPct}%`}
      >
        <span className="flex shrink-0 items-center gap-0.5 text-[0.55rem] leading-none tabular-nums text-foreground/75">
          <Sun className="h-2 w-2 text-amber-500/80" aria-hidden="true" />
          {dayPct}%
        </span>
        <span className="flex h-[3px] flex-1 overflow-hidden rounded-full bg-border">
          <span className="block h-full bg-amber-400/85" style={{ width: `${dayPct}%` }} />
          <span className="block h-full bg-slate-700/70" style={{ width: `${nightPct}%` }} />
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[0.55rem] leading-none tabular-nums text-foreground/75">
          {nightPct}%
          <Moon className="h-2 w-2 text-slate-600/80" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
