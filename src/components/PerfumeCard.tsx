import { useState } from "react";
import type { Perfume } from "@/lib/catalog";
import { useLocalized } from "@/lib/use-localized";
import { useI18n } from "@/lib/i18n";
import { PerfumeBadges } from "@/components/PerfumeBadges";
import { CommunityEvaluation } from "@/components/CommunityEvaluation";

/**
 * A discovery-only perfume card: image, name, availability badges, and the
 * community rating section with horizontal progress bars.
 */
export function PerfumeCard({ perfume }: { perfume: Perfume }) {
  const localize = useLocalized();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const name = localize(perfume.name);

  return (
    <article className="group overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_10px_40px_-26px_oklch(0.145_0_0/0.6)]">
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={perfume.image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="px-6 pb-8 pt-6 text-center">
        <h2 className="text-xl font-bold tracking-[0.06em] text-card-foreground">
          {name}
        </h2>

        <div className="mt-3">
          <PerfumeBadges badges={perfume.badges} />
        </div>

        <span className="mx-auto mt-6 block h-px w-10 bg-primary/50" aria-hidden="true" />

        <div className="mt-6">
          <CommunityEvaluation ratings={perfume.ratings} />

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-6 text-xs font-normal tracking-[0.18em] text-primary transition-colors hover:text-primary/70"
            aria-expanded={expanded}
          >
            {t("home.card.action")}
          </button>
        </div>
      </div>
    </article>
  );
}
