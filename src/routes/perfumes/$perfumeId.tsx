import { useEffect, useRef } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { OrderForm } from "@/components/OrderForm";
import { PerfumeStats } from "@/components/PerfumeStats";
import { productCard } from "@/components/product-card";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { meta } from "@/lib/meta";
import { formatPrice } from "@/lib/currency";
import {
  usePerfumes,
  useOffers,
  findPerfumeByParam,
  individualOfferForPerfume,
  collectionForPerfume,
  effectiveOfferPrice,
  referenceOfferPrice,
} from "@/lib/data";
import { CAMPUS_PARAM_VALUE, isCampusContext, type CampusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
import type { CatalogOffer } from "@/lib/data";
import type { Perfume } from "@/lib/catalog";

export const Route = createFileRoute("/perfumes/$perfumeId")({
  validateSearch: (search: Record<string, unknown>): CampusSearch => {
    // Campus travels in the URL, so a customer who activated it on the Home hero
    // reaches this page already in Campus context and is never asked again.
    return isCampusContext(search.campus) ? { campus: CAMPUS_PARAM_VALUE } : {};
  },
  head: () => ({
    meta: [
      { title: "Perfume — RAHIQ Parfums | رحيق" },
      {
        name: "description",
        content: "Order a RAHIQ perfume on its own, with delivery across Algeria.",
      },
      { property: "og:title", content: "Perfume — RAHIQ Parfums | رحيق" },
      {
        property: "og:description",
        content: "Order a RAHIQ perfume on its own, with delivery across Algeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerfumeDetailsPage,
});

function PerfumeLoading() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    </SiteLayout>
  );
}

/**
 * Resolves the perfume and the offer that sells it on its own.
 *
 * Every branch is decided before any of the view's hooks mount, so hook order in
 * the rendered subtree stays stable, and the view is keyed by perfume id to force
 * a fresh mount (and a single ViewContent event) when moving between perfumes.
 */
function PerfumeDetailsPage() {
  const { perfumeId } = Route.useParams();
  const { campus } = Route.useSearch();
  const { data: perfumes = [], isPending: perfumesPending } = usePerfumes(false);
  const { data: offers = [], isPending: offersPending } = useOffers(false);
  const { t } = useI18n();

  const perfume = findPerfumeByParam(perfumes, perfumeId);
  const individual = perfume ? individualOfferForPerfume(offers, perfume) : undefined;
  const collection = perfume && !individual ? collectionForPerfume(offers, perfume) : undefined;
  const isCampus = isCampusContext(campus);

  if ((perfumesPending || offersPending) && !perfume) return <PerfumeLoading />;
  if (!perfume) throw notFound();

  if (individual) {
    return (
      <PerfumeDetailsView
        key={perfume.id}
        perfume={perfume}
        offer={individual}
        isCampus={isCampus}
      />
    );
  }

  return (
    <UnavailablePerfumeView
      key={perfume.id}
      perfume={perfume}
      collection={collection}
      isCampus={isCampus}
      title={t("perfumeDetails.notSoldAlone")}
    />
  );
}

function scrollToOrderForm() {
  const el = document.getElementById("order-form-section");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * The individual perfume order view: a single product card, the compact
 * fragrance information, then the existing `OrderForm`.
 *
 * The product card shows only what identifies the product — image, name, real
 * price, one order action. No marketing paragraph, no collection contents, no
 * extra badges: the customer clicked a perfume, so this page is about that
 * perfume alone.
 */
function PerfumeDetailsView({
  perfume,
  offer,
  isCampus,
}: {
  perfume: Perfume;
  offer: CatalogOffer;
  isCampus: boolean;
}) {
  const localize = useLocalized();
  const { t } = useI18n();
  const tracked = useRef<string | null>(null);

  const name = localize(perfume.name);
  const price = effectiveOfferPrice(offer);
  const oldPrice = referenceOfferPrice(offer);
  const isReduced = oldPrice != null && oldPrice > price;

  useEffect(() => {
    const signature = `${perfume.id}|${name}|${price}`;
    if (tracked.current === signature) return;
    tracked.current = signature;
    meta.init();
    meta.viewContent({ contentIds: [perfume.id], contentName: name, value: price });
  }, [perfume.id, name, price]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 pt-8 pb-4 sm:pt-12">
        <Link
          to="/perfumes"
          search={{}}
          className="text-xs font-normal tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          {t("perfumeDetails.back")}
        </Link>
      </section>

      {/* 1. The product card — identity and price first, nothing else. */}
      <section className="mx-auto max-w-xs px-6 sm:max-w-sm">
        <article
          className={cn(productCard.root, "shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.45)]")}
        >
          <div className={productCard.media}>
            <img src={perfume.image} alt={name} className={productCard.image} decoding="async" />
            {isReduced && (
              <span className={cn(productCard.badge, productCard.badgeSolid, productCard.badgeEnd)}>
                -{Math.round(((oldPrice! - price) / oldPrice!) * 100)}%
              </span>
            )}
          </div>

          <div className={productCard.body}>
            <h1 className={cn(productCard.title, "text-center text-sm leading-snug")}>{name}</h1>

            <div className="mt-3">
              <div className="flex items-end justify-center gap-1.5">
                <span className={cn(productCard.price, "text-base")}>{formatPrice(price)}</span>
                {isReduced && (
                  <span className={productCard.oldPrice}>{formatPrice(oldPrice!)}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToOrderForm}
              className="mt-3 w-full rounded-full bg-primary px-4 py-2.5 text-xs font-bold tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("product.order")}
            </button>
          </div>
        </article>
      </section>

      {/* 2. Compact fragrance information — secondary to the product. */}
      <section className="mx-auto max-w-xs px-6 pt-4 sm:max-w-sm">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <h2 className="mb-2 text-center text-[0.55rem] font-semibold tracking-[0.16em] text-muted-foreground">
            {t("perfumeDetails.fragrance")}
          </h2>
          <PerfumeStats ratings={perfume.ratings} showRating />
        </div>
      </section>

      <section
        id="order-form-section"
        className="mx-auto max-w-2xl scroll-mt-20 px-6 pt-10 pb-28 sm:pb-32"
      >
        <h2 className="mb-8 text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
          {t("perfumeDetails.orderForm")}
        </h2>
        {/* The existing order mechanism, unchanged: customer fields, wilaya and
            commune, Campus context, email, Meta Pixel and success flow all still
            come from OrderForm. Only the product being ordered is new. */}
        <OrderForm offer={offer} initialDeliveryMode={isCampus ? "campus" : "normal"} />
      </section>

      <button
        type="button"
        onClick={scrollToOrderForm}
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-primary-foreground shadow-[0_12px_36px_-12px_oklch(0.145_0_0/0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95 sm:bottom-7"
        aria-label={t("order.submitNow")}
      >
        {t("order.submitNow")}
      </button>
    </SiteLayout>
  );
}

/**
 * A perfume the Dashboard does not sell on its own yet.
 *
 * This page never invents a price and never quietly sends the customer to a
 * collection: a perfume that is only part of a set has no individual price, so
 * it says so and names the collection as a separate, explicitly labelled action.
 * The customer is never charged for perfumes they did not choose.
 */
function UnavailablePerfumeView({
  perfume,
  collection,
  isCampus,
  title,
}: {
  perfume: Perfume;
  collection?: CatalogOffer;
  isCampus: boolean;
  title: string;
}) {
  const localize = useLocalized();
  const { t } = useI18n();
  const name = localize(perfume.name);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 pt-8 pb-4 sm:pt-12">
        <Link
          to="/perfumes"
          search={{}}
          className="text-xs font-normal tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          {t("perfumeDetails.back")}
        </Link>
      </section>

      <section className="mx-auto max-w-xs px-6 sm:max-w-sm">
        <article className={productCard.root}>
          <div className={productCard.media}>
            <img src={perfume.image} alt={name} className={productCard.image} decoding="async" />
          </div>
          <div className={productCard.body}>
            <h1 className={cn(productCard.title, "text-center text-sm leading-snug")}>{name}</h1>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-xs px-6 pt-4 sm:max-w-sm">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3">
          <h2 className="mb-2 text-center text-[0.55rem] font-semibold tracking-[0.16em] text-muted-foreground">
            {t("perfumeDetails.fragrance")}
          </h2>
          <PerfumeStats ratings={perfume.ratings} showRating />
        </div>
      </section>

      <section className="mx-auto max-w-md px-6 pt-8 pb-28 text-center sm:pb-32">
        <h2 className="text-base font-bold tracking-[0.1em] text-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {t("perfumeDetails.notSoldAloneText")}
        </p>
        {collection && (
          <Link
            to="/offers/$offerId"
            params={{ offerId: collection.id }}
            search={{ campus: isCampus ? CAMPUS_PARAM_VALUE : undefined }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-xs font-bold tracking-[0.06em] text-primary transition-colors hover:bg-primary/15"
          >
            {t("perfumeDetails.orderCollection")}
            <span className="font-normal text-muted-foreground">{localize(collection.name)}</span>
          </Link>
        )}
      </section>
    </SiteLayout>
  );
}
