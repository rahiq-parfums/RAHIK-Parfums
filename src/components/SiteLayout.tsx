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
      <h1 className="text-3xl font-bold tracking-[0.1em] text-foreground sm:text-5xl">{title}</h1>
      <span className="mx-auto mt-5 block h-px w-12 bg-primary/60" aria-hidden="true" />
      <p className="mx-auto mt-5 max-w-lg text-lg font-normal leading-relaxed text-muted-foreground">
        {text}
      </p>
    </section>
  );
}
