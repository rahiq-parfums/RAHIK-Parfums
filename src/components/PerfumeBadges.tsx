import { useI18n } from "@/lib/i18n";
import type { BadgeKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<BadgeKey, string> = {
  original: "border-primary/50 bg-primary/10 text-primary",
  ordinary: "border-border bg-muted text-muted-foreground",
  fois2: "border-primary/40 bg-accent text-accent-foreground",
  fois3: "border-primary/40 bg-accent text-accent-foreground",
};

export function PerfumeBadges({ badges }: { badges: BadgeKey[] }) {
  const { t } = useI18n();

  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {badges.map((badge) => (
        <li
          key={badge}
          className={cn(
            "inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-normal tracking-[0.1em] transition-colors",
            BADGE_STYLES[badge],
          )}
        >
          {t(`badge.${badge}`)}
        </li>
      ))}
    </ul>
  );
}
