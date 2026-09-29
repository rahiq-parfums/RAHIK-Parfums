import { Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Perfume } from "@/lib/catalog";

/**
 * Fragrantica-inspired compact perfume metadata.
 *
 * Same Dashboard-managed figures as before (community score, season
 * percentages, day/night split, community verdict) rendered as micro-meters
 * instead of large progress rings, so a whole card fits in roughly a third of
 * a phone screen.
 */
export function PerfumeStats({ ratings }: { ratings: Perfume["ratings"] }) {
  const { t } = useI18n();

  const seasons = [
    { key: "spring", label: t("rating.spring"), value: ratings.seasons.spring },
    { key: "summer", label: t("rating.summer"), value: ratings.seasons.summer },
    { key: "autumn", label: t("rating.autumn"), value: ratings.seasons.autumn },
    { key: "winter", label: t("rating.winter"), value: ratings.seasons.winter },
  ];

  const day = Math.max(0, Math.min(100, ratings.time.day));
  const night = Math.max(0, Math.min(100, ratings.time.night));
  const dayTotal = day + night || 1;

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-4 gap-1">
        {seasons.map((season) => (
          <div key={season.key} className="min-w-0">
            <span className="block truncate text-[0.5rem] leading-tight tracking-[0.04em] text-muted-foreground">
              {season.label}
            </span>
            <span className="mt-0.5 block h-px w-full overflow-hidden bg-border">
              <span
                className="block h-full bg-primary/80"
                style={{ width: `${Math.max(0, Math.min(100, season.value))}%` }}
              />
            </span>
            <span className="mt-0.5 block text-[0.55rem] leading-none tabular-nums text-foreground/75">
              {season.value}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="flex shrink-0 items-center gap-0.5 text-[0.55rem] leading-none tabular-nums text-foreground/75">
          <Sun className="h-2 w-2 text-primary" aria-hidden="true" />
          {Math.round((day / dayTotal) * 100)}%
        </span>
        <span className="flex h-[3px] flex-1 overflow-hidden rounded-full bg-border">
          <span
            className="block h-full bg-primary"
            style={{ width: `${(day / dayTotal) * 100}%` }}
          />
          <span
            className="block h-full bg-foreground/30"
            style={{ width: `${(night / dayTotal) * 100}%` }}
          />
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[0.55rem] leading-none tabular-nums text-foreground/75">
          {Math.round((night / dayTotal) * 100)}%
          <Moon className="h-2 w-2" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
