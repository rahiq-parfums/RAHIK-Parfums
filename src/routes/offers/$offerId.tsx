import { useEffect, useRef } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ImageGallery } from "@/components/ImageGallery";
import { PriceTag } from "@/components/PriceTag";
import { OrderForm } from "@/components/OrderForm";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { meta } from "@/lib/meta";
import { useOffers, findOfferByParam, type CatalogOffer } from "@/lib/data";
import { CAMPUS_PARAM_VALUE, isCampusContext } from "@/lib/campus";

export const Route = createFileRoute("/offers/$offerId")({
  validateSearch: (search: Record<string, unknown>): { campus?: string } => {
    // The Campus context is carried in the URL so it survives Home → catalogue
    // → order navigation without any global state.
    return isCampusContext(search.campus) ? { campus: CAMPUS_PARAM_VALUE } : {};
  },
  head: () => ({
    meta: [
      { title: "Offer Details — RAHIQ Parfums | رحيق" },
      {
        name: "description",
        content: "Details of a curated fragrance set from RAHIQ Parfums.",
      },
      { property: "og:title", content: "Offer Details — RAHIQ Parfums | رحيق" },
      {
        property: "og:description",
        content: "Details of a curated fragrance set from RAHIQ Parfums.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferDetailsPage,
});

function OfferLoading() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    </SiteLayout>
  );
}

/**
 * Resolves the route parameter to a Dashboard-managed offer.
 *
 * Every state branch is decided here, before any of the view's hooks mount, so
 * the hook order of the rendered subtree is always stable. The view is keyed by
 * the offer id, which also guarantees a fresh mount (and a single ViewContent
 * event) whenever the visitor moves between offers.
 */
function OfferDetailsPage() {
  const { offerId } = Route.useParams();
  const { campus } = Route.useSearch();
  const { data: offers = [], isPending, isError, refetch, isFetching } = useOffers(false);
  const { t } = useI18n();

  const offer = findOfferByParam(offers, offerId);
  const isCampus = isCampusContext(campus);

  if (isError) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-lg font-semibold text-foreground">{t("offerDetails.loadError")}</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {t("offerDetails.loadErrorText")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t("offerDetails.retry")}
          </button>
        </div>
      </SiteLayout>
    );
  }

  if (isPending && !offer) return <OfferLoading />;
  if (!offer) throw notFound();

  return <OfferDetailsView key={offer.id} offer={offer} isCampus={isCampus} />;
}

function OfferDetailsView({ offer, isCampus }: { offer: CatalogOffer; isCampus: boolean }) {
  const localize = useLocalized();
  const { t } = useI18n();
  const tracked = useRef<string | null>(null);

  const name = localize(offer.name);
  const description = localize(offer.description);
  const longDesc = offer.longDescription ? localize(offer.longDescription) : "";

  const price =
    offer.discount?.enabled && offer.discount.newPrice > 0 ? offer.discount.newPrice : offer.price;
  const oldP = offer.discount?.enabled ? offer.discount.oldPrice : offer.oldPrice;

  useEffect(() => {
    const signature = `${offer.id}|${name}|${price}`;
    if (tracked.current === signature) return;
    tracked.current = signature;
    meta.init();
    meta.viewContent({
      contentIds: [offer.id],
      contentName: name,
      value: price,
    });
  }, [offer.id, name, price]);

  function scrollToOrderForm() {
    const el = document.getElementById("order-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 pt-10 pb-6 sm:pt-16">
        <Link
          to="/offers"
          className="text-xs font-normal tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          {t("offerDetails.backToOffers")}
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10">
        <ImageGallery images={offer.images} alt={name} />
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-10 text-center">
        <h1 className="text-3xl font-bold tracking-[0.1em] text-foreground sm:text-5xl">{name}</h1>
        <span className="mx-auto mt-6 block h-px w-12 bg-primary/60" aria-hidden="true" />
        <div className="mt-6">
          <PriceTag
            price={price}
            oldPrice={oldP}
            className="justify-center"
            priceClassName="text-2xl font-bold tracking-[0.06em]"
          />
        </div>
        <p className="mx-auto mt-6 max-w-md text-lg font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
        {longDesc && (
          <p className="mx-auto mt-4 max-w-md text-base font-normal leading-relaxed text-muted-foreground/80">
            {longDesc}
          </p>
        )}
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-12">
        <div className="rounded-2xl border border-primary/20 bg-card p-7 shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] sm:p-9">
          <h2 className="text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
            {t("offerDetails.contents")}
          </h2>
          <span className="mx-auto mt-5 block h-px w-10 bg-primary/50" aria-hidden="true" />
          <ul className="mt-6 space-y-4">
            {offer.includes.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-base font-normal text-card-foreground"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                  aria-hidden="true"
                />
                {localize(item)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="mb-8 text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
          {t("offerDetails.perfumes")}
        </h2>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4">
          {offer.perfumes.map((perfume, i) => (
            <article
              key={i}
              className="group overflow-hidden rounded-xl border border-primary/20 bg-card shadow-[0_2px_18px_-18px_oklch(0.145_0_0/0.5)] transition-all duration-500 hover:border-primary/40"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={perfume.image}
                  alt={localize(perfume.name)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="px-2 py-2.5 text-center sm:px-3 sm:py-3">
                <h3 className="truncate text-xs font-bold tracking-[0.04em] text-card-foreground sm:text-sm">
                  {localize(perfume.name)}
                </h3>
                <span className="mx-auto mt-1.5 block h-px w-6 bg-primary/40" aria-hidden="true" />
                <p className="mt-1.5 hidden text-xs font-normal leading-relaxed text-muted-foreground sm:line-clamp-2">
                  {localize(perfume.description)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="order-form-section"
        className="mx-auto max-w-2xl scroll-mt-20 px-6 pb-28 sm:pb-32"
      >
        <h2 className="mb-8 text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
          {t("offerDetails.orderForm")}
        </h2>
        <OrderForm offer={offer} initialDeliveryMode={isCampus ? "campus" : "normal"} />
      </section>

      <button
        type="button"
        onClick={scrollToOrderForm}
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-primary-foreground shadow-[0_12px_36px_-12px_oklch(0.145_0_0/0.55)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_44px_-12px_oklch(0.145_0_0/0.6)] active:scale-95 sm:bottom-7"
        aria-label={t("order.submitNow")}
      >
        {t("order.submitNow")}
      </button>
    </SiteLayout>
  );
}
