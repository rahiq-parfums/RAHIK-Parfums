import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/SiteLayout";
import { PerfumeCard } from "@/components/PerfumeCard";
import { useI18n } from "@/lib/i18n";
import { useCatalogue } from "@/lib/data";
import { CAMPUS_PARAM_VALUE, isCampusContext, type CampusSearch } from "@/lib/campus";

export const Route = createFileRoute("/perfumes")({
  validateSearch: (search: Record<string, unknown>): CampusSearch => {
    // RAHIQ Campus hands its context to the catalogue, which passes it on to
    // the order page through the same param.
    return isCampusContext(search.campus) ? { campus: CAMPUS_PARAM_VALUE } : {};
  },
  head: () => ({
    meta: [
      { title: "Perfumes — RAHIQ Parfums | رحيق" },
      {
        name: "description",
        content: "The RAHIQ Parfums fragrance collection: limited, carefully curated perfumes.",
      },
      { property: "og:title", content: "Perfumes — RAHIQ Parfums | رحيق" },
      {
        property: "og:description",
        content: "The RAHIQ Parfums fragrance collection: limited, carefully curated perfumes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerfumesPage,
});

function PerfumesPage() {
  const { t } = useI18n();
  const { campus } = Route.useSearch();
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: "/perfumes/$perfumeId" });

  // Same hook as Home: one product source, one price source, one card.
  const { items, isPending } = useCatalogue(true);
  const isCampus = isCampusContext(campus);

  // `/perfumes/$perfumeId` is a child of this route, so the individual perfume
  // order view is rendered in its place rather than below the catalogue.
  if (isDetail) {
    return <Outlet />;
  }

  return (
    <SiteLayout>
      <PageIntro title={t("perfumes.title")} text={t("perfumes.intro")} />

      {isCampus && (
        <p className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          {t("campus.active")}
        </p>
      )}

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        {isPending ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <PerfumeCard key={item.perfume.id} perfume={item.perfume} campus={isCampus} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            {t("home.empty")}
          </p>
        )}
      </section>
    </SiteLayout>
  );
}
