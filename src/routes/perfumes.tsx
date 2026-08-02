import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/SiteLayout";
import { PerfumeCard } from "@/components/PerfumeCard";
import { useI18n } from "@/lib/i18n";
import { usePerfumes } from "@/lib/data";

export const Route = createFileRoute("/perfumes")({
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
  const { data: perfumes = [] } = usePerfumes(true);

  return (
    <SiteLayout>
      <PageIntro title={t("perfumes.title")} text={t("perfumes.intro")} />
      <section className="mx-auto max-w-5xl px-6 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
          {perfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
