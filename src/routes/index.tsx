import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo, BrandName } from "@/components/BrandLogo";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";

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

const CATEGORY_CARDS = [
  {
    to: "/perfumes",
    titleKey: "home.card.perfumes.title",
    textKey: "home.card.perfumes.text",
    ctaKey: "home.card.perfumes.cta",
    image: "https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  },
  {
    to: "/offers",
    titleKey: "home.card.offers.title",
    textKey: "home.card.offers.text",
    ctaKey: "home.card.offers.cta",
    image: "https://images.pexels.com/photos/36482359/pexels-photo-36482359.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  },
  {
    to: "/discounts",
    titleKey: "home.card.discounts.title",
    textKey: "home.card.discounts.text",
    ctaKey: "home.card.discounts.cta",
    image: "https://images.pexels.com/photos/7702669/pexels-photo-7702669.jpeg?auto=compress&cs=tinysrgb&h=900&w=600",
  },
] as const;

function Index() {
  const { t } = useI18n();

  return (
    <SiteLayout revealLogoOnScroll>
      {/* Hero */}
      <section className="mx-auto max-w-2xl px-6 pt-14 pb-12 text-center sm:pt-20 sm:pb-14">
        <BrandLogo className="fade-in-up mx-auto h-24 w-auto sm:h-32" />
        <div className="mt-6">
          <BrandName className="text-base font-bold sm:text-lg" />
        </div>
        <span className="mx-auto mt-7 block h-px w-12 bg-primary/60" aria-hidden="true" />
        <p className="mx-auto mt-7 max-w-lg text-lg font-normal leading-relaxed text-foreground/80">
          {t("home.intro")}
        </p>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-5xl px-6 pb-20 sm:pb-28">
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {CATEGORY_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-primary/20 shadow-[0_2px_30px_-20px_oklch(0.145_0_0/0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_50px_-28px_oklch(0.145_0_0/0.6)] sm:min-h-[26rem]"
            >
              {/* Background image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={card.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="relative z-10 p-7 text-center sm:p-8">
                <h2 className="text-xl font-bold tracking-[0.14em] text-white sm:text-2xl">
                  {t(card.titleKey)}
                </h2>
                <span className="mx-auto mt-4 block h-px w-10 bg-primary/70 transition-all duration-500 group-hover:w-16" aria-hidden="true" />
                <p className="mt-4 text-base font-normal leading-relaxed text-white/80">
                  {t(card.textKey)}
                </p>
                <span className="mt-6 inline-flex items-center rounded-full border-2 border-primary/60 bg-primary/20 px-8 py-3 text-sm font-bold tracking-[0.14em] text-primary backdrop-blur-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  {t(card.ctaKey)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
