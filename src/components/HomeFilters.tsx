import { useI18n } from "@/lib/i18n";
import type { PerfumeGender } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * The three Home filters. They are independent multi-select toggles, not tabs:
 * the customer may combine any of them, and none selected means "no filtering".
 */
export const HOME_FILTERS = [
  { id: "discounted", labelKey: "home.filter.discounts" },
  { id: "women", labelKey: "home.filter.women" },
  { id: "men", labelKey: "home.filter.men" },
] as const;

export type HomeFilterId = (typeof HOME_FILTERS)[number]["id"];

/** All filters off = the customer explicitly wants to see everything. */
export type ActiveFilters = Record<HomeFilterId, boolean>;

/** No filter active is the correct initial state — never auto-select one. */
export const NO_FILTERS: ActiveFilters = {
  discounted: false,
  women: false,
  men: false,
};

export function toggleFilter(filters: ActiveFilters, id: HomeFilterId): ActiveFilters {
  return { ...filters, [id]: !filters[id] };
}

export function hasActiveFilter(filters: ActiveFilters): boolean {
  return HOME_FILTERS.some((filter) => filters[filter.id]);
}

/** The minimal shape the filter logic needs, so it stays decoupled from data. */
export type FilterableItem = { gender: PerfumeGender; isDiscounted: boolean };

/**
 * Multi-select semantics: AND between the discount condition and the gender
 * group, OR inside the gender group.
 *
 *   none             → everything
 *   discounted       → only discounted items
 *   women            → only women
 *   men              → only men
 *   women + men      → women or men
 *   discounted+women → women that are currently discounted
 *   all three        → women or men that are currently discounted
 *
 * Unisex items are only returned when neither gender filter is active, because
 * selecting "women" means women — not "women and unisex".
 */
export function matchesFilters(item: FilterableItem, filters: ActiveFilters): boolean {
  if (filters.discounted && !item.isDiscounted) return false;

  const wantsWomen = filters.women;
  const wantsMen = filters.men;
  if (wantsWomen || wantsMen) {
    const genderMatches =
      (wantsWomen && item.gender === "women") || (wantsMen && item.gender === "men");
    if (!genderMatches) return false;
  }

  return true;
}

/**
 * Compact mobile-first multi-select filter bar.
 *
 * Each pill toggles independently and shows its active state with a check mark,
 * so the customer can always tell which conditions are applied. Exposed as a
 * `group` of toggle buttons rather than a `tablist`, because these are not
 * mutually exclusive views.
 */
export function HomeFilterBar({
  filters,
  onToggle,
  resultCount,
  isPending,
}: {
  filters: ActiveFilters;
  onToggle: (id: HomeFilterId) => void;
  resultCount?: number;
  isPending?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t("home.filtersLabel")}
    >
      {HOME_FILTERS.map((filter) => {
        const isActive = filters[filter.id];
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onToggle(filter.id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex min-w-0 items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.02em] transition-colors sm:text-sm",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground",
            )}
          >
            {isActive && (
              <svg
                viewBox="0 0 12 12"
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6.5 4.5 9 10 3" />
              </svg>
            )}
            {t(filter.labelKey)}
          </button>
        );
      })}

      {resultCount != null && !isPending && (
        <span className="ms-auto text-[0.7rem] tabular-nums text-muted-foreground">
          {resultCount}
        </span>
      )}
    </div>
  );
}
