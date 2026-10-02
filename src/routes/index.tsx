import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { OfferCard } from "@/components/OfferCard";
import { PerfumeCard } from "@/components/PerfumeCard";
import { CampusHero } from "@/components/CampusHero";
import {
  HomeFilterBar,
  NO_FILTERS,
  hasActiveFilter,
  matchesFilters,
  toggleFilter,
  type ActiveFilters,
} from "@/components/HomeFilters";
import { useI18n } from "@/lib/i18n";
import { useCatalogue } from "@/lib/data";
import { CAMPUS_PARAM_VALUE, isCampusContext, type CampusSearch } from "@/lib/campus";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): CampusSearch => {
    // Home carries the Campus context as well, so activating it from the hero is
    // remembered on refresh and travels on to the catalogue and the order page.
    return isCampusContext(search.campus) ? { campus: CAMPUS_PARAM_VALUE } : {};
  },
  head: () => ({
    meta: [
      { title: "RAHIQ Parfums | رحيق — Luxury Algerian Perfume House" },
      {
        name: "description",
        content:
          "RAHIQ Parfums — an Algerian luxury perfume house presenting limited fragrance collections, curated offers and selected discounts.",
      },
      { property: "og:title", content: "RAHIQ Parfums | رحيق — Luxury Algerian Perfume House" },
      {
        property: "og:description",
        content: "Limited fragrance collections from an Algerian luxury perfume house.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-6 bg-primary/50" aria-hidden="true" />
      <h2 className="text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground">
        {children}
      </h2>
    </div>
  );
}

function Index() {
  const { t } = useI18n();
  const { campus } = Route.useSearch();
  const isCampus = isCampusContext(campus);

  // No filter is active on arrival: the customer sees the whole catalogue and
  // chooses to narrow it. Nothing is ever auto-selected or auto-promoted.
  const [filters, setFilters] = useState<ActiveFilters>(NO_FILTERS);
  const isFiltering = hasActiveFilter(filters);

  // Home and /perfumes share this hook, so they always show the same products.
  const { items, offers, isPending } = useCatalogue(true);

  // Multi-select AND logic lives in one tested helper; nothing is auto-selected.
  const visibleItems = useMemo(
    () =>
      items.filter((item) =>
        matchesFilters({ gender: item.perfume.gender, isDiscounted: item.isDiscounted }, filters),
      ),
    [items, filters],
  );

  return (
    <SiteLayout>
      {/* The Campus photograph is the first thing on the page. */}
      <CampusHero active={isCampus} />

      <div className="bg-background">
        <section className="mx-auto max-w-5xl px-4 pt-10 pb-8 text-center sm:px-6 sm:pt-14">
          <span className="mx-auto block h-px w-10 bg-primary/60" aria-hidden="true" />
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            {t("home.intro")}
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
          <HomeFilterBar
            filters={filters}
            onToggle={(id) => setFilters((current) => toggleFilter(current, id))}
            resultCount={visibleItems.length}
            isPending={isPending}
          />

          <div className="mt-5">
            <SectionLabel>
              {isFiltering ? t("home.filteredLabel") : t("home.catalogueLabel")}
            </SectionLabel>
          </div>

          {isPending ? (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : visibleItems.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {visibleItems.map((item) => (
                <PerfumeCard
                  key={item.perfume.id}
                  perfume={item.perfume}
                  campus={isCampus}
                  price={
                    item.offer && item.price != null
                      ? { price: item.price, oldPrice: item.oldPrice }
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* The offers shelf is Home content, not filter content: it stays
            present whatever the customer has selected. */}
        {offers.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
            <SectionLabel>{t("home.offersLabel")}</SectionLabel>
            <div
              className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
              role="list"
            >
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  role="listitem"
                  className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]"
                >
                  <OfferCard offer={offer} campus={isCampus} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">{t("home.empty")}</p>
    </div>
  );
}
