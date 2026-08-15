import { useEffect } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ImageGallery } from "@/components/ImageGallery";
import { PriceTag } from "@/components/PriceTag";
import { OrderForm } from "@/components/OrderForm";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { meta } from "@/lib/meta";
import { useOffers } from "@/lib/data";

export const Route = createFileRoute("/offers/$offerId")({
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

function OfferDetailsPage() {
  const { offerId } = Route.useParams();
  const { data: offers = [], isLoading } = useOffers(false);
  const localize = useLocalized();
  const { t } = useI18n();

  const offer = offers.find((o) => o.id === offerId);

  if (isLoading && !offer) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!offer) throw notFound();

  const price =
    offer.discount?.enabled && offer.discount.newPrice > 0
      ? offer.discount.newPrice
      : offer.price;
  const oldP = offer.discount?.enabled ? offer.discount.oldPrice : offer.oldPrice;

  function scrollToOrderForm() {
    const el = document.getElementById("order-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const name = localize(offer.name);
  const description = localize(offer.description);
  useEffect(() => {
    if (offer) {
      meta.viewContent({
        contentIds: [offer.id],
        contentName: name,
        value: price,
      });
    }
  }, [offer?.id]);

  const longDesc = offer.longDescription ? localize(offer.longDescription) : "";

  useEffect(() => {
    if (offer) {
      meta.viewContent({
        contentIds: [offer.id],
        contentName: localize(offer.name),
        value: price,
      });
    }
  }, [offer?.id]);

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
        <h1 className="text-3xl font-bold tracking-[0.1em] text-foreground sm:text-5xl">
          {name}
        </h1>
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
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
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

      <section id="order-form-section" className="mx-auto max-w-2xl scroll-mt-20 px-6 pb-28 sm:pb-32">
        <h2 className="mb-8 text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
          {t("offerDetails.orderForm")}
        </h2>
        <OrderForm offer={offer} />
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
