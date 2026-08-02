import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function SiteLayout({
  children,
  revealLogoOnScroll = false,
}: {
  children: ReactNode;
  revealLogoOnScroll?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader revealLogoOnScroll={revealLogoOnScroll} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Shared page heading for inner pages. */
export function PageIntro({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 pt-12 pb-8 text-center sm:pt-20 sm:pb-12">
      <h1 className="text-3xl font-bold tracking-[0.1em] text-foreground sm:text-5xl">
        {title}
      </h1>
      <span className="mx-auto mt-5 block h-px w-12 bg-primary/60" aria-hidden="true" />
      <p className="mx-auto mt-5 max-w-lg text-lg font-normal leading-relaxed text-muted-foreground">
        {text}
      </p>
    </section>
  );
}

/** Placeholder product-style card used across Perfumes / Offers / Discounts. */
export function PlaceholderCard({
  label,
  description,
  imageLabel,
}: {
  label: string;
  description: string;
  imageLabel: string;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-primary/20 bg-card shadow-[0_2px_24px_-18px_oklch(0.145_0_0/0.5)] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_10px_40px_-26px_oklch(0.145_0_0/0.6)]">
      <div className="flex aspect-[3/4] items-center justify-center rounded-t-xl bg-muted">
        <span className="text-xs font-normal tracking-[0.2em] text-muted-foreground">
          {imageLabel}
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-base font-normal tracking-[0.12em] text-card-foreground">
          {label}
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}
