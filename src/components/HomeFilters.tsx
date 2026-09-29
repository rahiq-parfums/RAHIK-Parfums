import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const HOME_FILTERS = [
  { id: "discounts", labelKey: "home.filter.discounts" },
  { id: "women", labelKey: "home.filter.women" },
  { id: "men", labelKey: "home.filter.men" },
] as const;

export type HomeFilter = (typeof HOME_FILTERS)[number]["id"];

/**
 * Compact mobile-first segmented control for the three Home filters, exposed as
 * an accessible tablist.
 */
export function HomeFilterBar({
  value,
  onChange,
}: {
  value: HomeFilter;
  onChange: (next: HomeFilter) => void;
}) {
  const { t } = useI18n();

  return (
    <div
      role="tablist"
      aria-label={t("home.filtersLabel")}
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      {HOME_FILTERS.map((filter) => {
        const isActive = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.id)}
            className={cn(
              "min-w-0 flex-1 rounded-full px-2 py-2 text-[0.7rem] leading-tight font-semibold tracking-[0.02em] transition-colors sm:text-sm",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(filter.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
