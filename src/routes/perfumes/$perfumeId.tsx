import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { OrderForm } from "@/components/OrderForm";
import { PerfumeStats } from "@/components/PerfumeStats";
import { productCard } from "@/components/product-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { meta } from "@/lib/meta";
import { formatPrice } from "@/lib/currency";
import { usePerfumes, findPerfumeByParam } from "@/lib/data";
import { CAMPUS_PARAM_VALUE, isCampusContext, type CampusSearch } from "@/lib/campus";
import { cn } from "@/lib/utils";
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
 * Resolves the perfume before any of the view's hooks mount, so hook order in the
 * rendered subtree stays stable. The view is keyed by perfume id to force a fresh
 * mount (and a single ViewContent event) when moving between perfumes.
 */
function PerfumeDetailsPage() {
  const { perfumeId } = Route.useParams();
  const { campus } = Route.useSearch();
  const { data: perfumes = [], isPending } = usePerfumes(false);

  const perfume = findPerfumeByParam(perfumes, perfumeId);
  const isCampus = isCampusContext(campus);

  if (isPending && !perfume) return <PerfumeLoading />;
  if (!perfume) throw notFound();

  return <PerfumeDetailsView key={perfume.id} perfume={perfume} isCampus={isCampus} />;
}

function scrollToOrderForm() {
  const el = document.getElementById("order-form-section");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * The individual perfume order view.
 *
 * A perfume is a product in its own right, so this page is built like the offer
 * page: one compact card carrying the product identity and its real price,
 * `perfumes.price`, followed by the existing `OrderForm`. Nothing here is
 * borrowed from a collection — a perfume that belongs to a set is still bought as
 * that single perfume, at that perfume's own price.
 *
 * The fragrance statistics sit behind a collapsed control so the page opens on
 * the product and the order action rather than on percentages.
 */
function PerfumeDetailsView({ perfume, isCampus }: { perfume: Perfume; isCampus: boolean }) {
  const localize = useLocalized();
  const { t } = useI18n();
  const tracked = useRef<string | null>(null);
  const [specsOpen, setSpecsOpen] = useState(false);

  const name = localize(perfume.name);
  /**
   * `perfumes.price` is the only price this perfume may be sold at. It is `null`
   * while no individual price has been entered in the Dashboard, in which case
   * there is nothing to charge and no order form to show.
   */
  const price = perfume.price != null && perfume.price > 0 ? perfume.price : null;
  const canOrder = price != null;

  useEffect(() => {
    const signature = `${perfume.id}|${name}|${price ?? ""}`;
    if (tracked.current === signature) return;
    tracked.current = signature;
    meta.init();
    // A perfume with no individual price yet reports a value of 0, which keeps the
    // ViewContent event meaningful instead of dropping it or inventing a number.
    meta.viewContent({ contentIds: [perfume.id], contentName: name, value: price ?? 0 });
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
          </div>

          <div className={productCard.body}>
            <h1 className={cn(productCard.title, "text-center text-sm leading-snug")}>{name}</h1>

            <div className="mt-3 flex items-end justify-center gap-1.5">
              {canOrder ? (
                <span className={cn(productCard.price, "text-base")}>{formatPrice(price)}</span>
              ) : (
                <span className="text-xs font-normal tracking-[0.08em] text-muted-foreground">
                  {t("perfumeDetails.pricePending")}
                </span>
              )}
            </div>

            {canOrder && (
              <button
                type="button"
                onClick={scrollToOrderForm}
                className="mt-3 w-full rounded-full bg-primary px-4 py-2.5 text-xs font-bold tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("product.order")}
              </button>
            )}
          </div>
        </article>
      </section>

      {/* 2. Fragrance specifications, collapsed by default. */}
      <section className="mx-auto max-w-xs px-6 pt-3 sm:max-w-sm">
        <Collapsible open={specsOpen} onOpenChange={setSpecsOpen}>
          <CollapsibleTrigger
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card/60 px-3 py-2.5 text-[0.55rem] font-semibold tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("perfumeDetails.specs")}
          >
            {t("perfumeDetails.specs")}
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", specsOpen && "rotate-180")}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="rounded-xl border border-border/70 bg-card/60 p-3">
              <PerfumeStats ratings={perfume.ratings} showRating />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* 3. The order form — the same checkout an offer uses, unchanged. */}
      {canOrder && (
        <section
          id="order-form-section"
          className="mx-auto max-w-2xl scroll-mt-20 px-6 pt-10 pb-28 sm:pb-32"
        >
          <h2 className="mb-8 text-center text-base font-bold tracking-[0.14em] text-muted-foreground">
            {t("perfumeDetails.orderForm")}
          </h2>
          {/* The existing order mechanism, unchanged: customer fields, wilaya and
              commune, Campus context, email, Meta Pixel and success flow all still
              come from OrderForm. Only the product being ordered is new, and it
              identifies itself as a perfume through `kind`. */}
          <OrderForm
            offer={{
              kind: "perfume",
              id: perfume.id,
              name: perfume.name,
              price,
              freeDelivery: false,
            }}
            initialDeliveryMode={isCampus ? "campus" : "normal"}
          />
        </section>
      )}

      {canOrder && (
        <button
          type="button"
          onClick={scrollToOrderForm}
          className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-primary-foreground shadow-[0_12px_36px_-12px_oklch(0.145_0_0/0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95 sm:bottom-7"
          aria-label={t("order.submitNow")}
        >
          {t("order.submitNow")}
        </button>
      )}
    </SiteLayout>
  );
}
