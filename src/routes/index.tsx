import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BrandLogo, BrandName } from "@/components/BrandLogo";
import { SiteLayout } from "@/components/SiteLayout";
import { OfferCard } from "@/components/OfferCard";
import { PerfumeCard } from "@/components/PerfumeCard";
import { CampusSection } from "@/components/CampusSection";
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

export const Route = createFileRoute("/")({
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
        matchesFilters(
          { gender: item.perfume.gender, isDiscounted: item.isDiscounted },
          filters,
        ),
      ),
    [items, filters],
  );

  // The offers shelf is Home content, not filter content: it stays present
  // whatever the customer has selected.
  const shelfOffers = isFiltering ? [] : offers;

  return (
    <SiteLayout revealLogoOnScroll>
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-6 text-center sm:px-6 sm:pt-12">
        <BrandLogo className="fade-in-up mx-auto h-16 w-auto sm:h-24" />
        <div className="mt-4">
          <BrandName className="text-sm font-bold sm:text-base" />
        </div>
        <span className="mx-auto mt-5 block h-px w-10 bg-primary/60" aria-hidden="true" />
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
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
                price={
                  item.offer && item.price != null
                    ? { price: item.price, oldPrice: item.oldPrice, offerId: item.offer.id }
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {shelfOffers.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
          <SectionLabel>{t("home.offersLabel")}</SectionLabel>
          <div
            className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
            role="list"
          >
            {shelfOffers.map((offer) => (
              <div
                key={offer.id}
                role="listitem"
                className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]"
              >
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pb-12 sm:pb-16">
        <CampusSection />
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
