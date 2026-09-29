import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo, BrandName } from "@/components/BrandLogo";
import { SiteLayout } from "@/components/SiteLayout";
import { OfferCard } from "@/components/OfferCard";
import { PerfumeCard } from "@/components/PerfumeCard";
import { CampusSection } from "@/components/CampusSection";
import { HomeFilterBar, type HomeFilter } from "@/components/HomeFilters";
import { useI18n } from "@/lib/i18n";
import {
  useOffers,
  usePerfumes,
  effectiveOfferPrice,
  referenceOfferPrice,
  findOfferForPerfume,
  indexOffersByPerfume,
  type CatalogOffer,
} from "@/lib/data";
import type { Perfume } from "@/lib/catalog";

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

  const [filter, setFilter] = useState<HomeFilter>("discounts");
  const promoted = useRef(false);

  const { data: perfumes = [], isPending: perfumesPending } = usePerfumes(true);
  const { data: offers = [], isPending: offersPending } = useOffers(true);

  const discounted = useMemo(() => offers.filter((offer) => offer.discount?.enabled), [offers]);
  const womenPerfumes = useMemo(() => perfumes.filter((p) => p.gender === "women"), [perfumes]);
  const menPerfumes = useMemo(() => perfumes.filter((p) => p.gender === "men"), [perfumes]);
  const offerByPerfume = useMemo(() => indexOffersByPerfume(offers), [offers]);

  const isPending = perfumesPending || offersPending;

  // The Home must never open on an empty grid: if the Dashboard currently has
  // no active discount, fall through to the first filter that has content.
  useEffect(() => {
    if (promoted.current || isPending) return;
    promoted.current = true;
    if (discounted.length > 0) return;
    if (womenPerfumes.length > 0) setFilter("women");
    else if (menPerfumes.length > 0) setFilter("men");
  }, [isPending, discounted.length, womenPerfumes.length, menPerfumes.length]);

  const activeLabel = t(
    filter === "discounts"
      ? "home.filter.discounts"
      : filter === "women"
        ? "home.filter.women"
        : "home.filter.men",
  );

  const activePerfumes: Perfume[] =
    filter === "women" ? womenPerfumes : filter === "men" ? menPerfumes : [];

  const shelfOffers: CatalogOffer[] =
    filter === "discounts" ? offers.filter((offer) => !offer.discount?.enabled) : offers;

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
        <div className="mx-auto max-w-md">
          <HomeFilterBar value={filter} onChange={setFilter} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <SectionLabel>{activeLabel}</SectionLabel>
          {!isPending && (
            <span className="text-[0.7rem] tabular-nums text-muted-foreground">
              {filter === "discounts" ? discounted.length : activePerfumes.length}
            </span>
          )}
        </div>

        {isPending ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : filter === "discounts" ? (
          discounted.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {discounted.map((offer) => (
                <OfferCard key={offer.id} offer={offer} withCountdown />
              ))}
            </div>
          ) : (
            <EmptyState />
          )
        ) : activePerfumes.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {activePerfumes.map((perfume) => {
              const offer = findOfferForPerfume(offerByPerfume, perfume);
              return (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  price={
                    offer
                      ? {
                          price: effectiveOfferPrice(offer),
                          oldPrice: referenceOfferPrice(offer),
                          offerId: offer.id,
                        }
                      : undefined
                  }
                />
              );
            })}
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

      <section className="mx-auto max-w-5xl px-4 pb-20 text-center sm:px-6 sm:pb-28">
        <h2 className="text-lg font-bold tracking-[0.06em] text-foreground sm:text-2xl">
          {t("home.catalogCta.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
          {t("home.catalogCta.text")}
        </p>
        <Link
          to="/perfumes"
          className="mt-6 inline-flex items-center rounded-full border border-primary/50 px-7 py-3 text-sm font-bold tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t("home.catalogCta.cta")}
        </Link>
      </section>
    </SiteLayout>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">{t("home.empty")}</p>
      <Link
        to="/perfumes"
        className="mt-3 inline-block text-xs font-semibold tracking-[0.1em] text-primary hover:opacity-80"
      >
        {t("home.catalogCta.cta")}
      </Link>
    </div>
  );
}
