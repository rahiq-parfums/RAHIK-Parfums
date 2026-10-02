/**
 * Shared visual primitives for every public purchasable card.
 *
 * A perfume and a collection offer are both products in the same shop, so they
 * must look like they come from the same system: one card shape, one media
 * frame, one title scale, one price row and one order button. Keeping the class
 * strings here means a future restyle touches a single place instead of two
 * duplicated cards drifting apart.
 */
export const productCard = {
  root: "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_20px_-18px_oklch(0.145_0_0/0.45)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_12px_36px_-26px_oklch(0.145_0_0/0.55)]",
  media: "relative aspect-[4/5] overflow-hidden bg-muted",
  image: "h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]",
  badge: "rounded-full px-2 py-1 text-[0.58rem] font-bold leading-none tracking-[0.1em]",
  badgeStart: "absolute start-2 top-2",
  badgeEnd: "absolute end-2 top-2",
  badgeSolid: "bg-primary text-primary-foreground",
  badgeQuiet: "bg-background/85 text-foreground backdrop-blur-sm",
  body: "flex flex-1 flex-col p-2.5 sm:p-3",
  title: "text-[0.8rem] font-semibold leading-tight text-card-foreground",
  note: "truncate text-[0.58rem] leading-none tracking-[0.04em] text-muted-foreground",
  priceRow: "mt-auto flex items-end justify-between gap-2 pt-2.5",
  price: "text-[0.8rem] font-bold tabular-nums text-primary",
  oldPrice: "text-[0.6rem] tabular-nums text-muted-foreground line-through",
  cta: "shrink-0 rounded-full bg-primary px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.04em] text-primary-foreground transition-opacity hover:opacity-90",
  quiet: "truncate text-[0.58rem] leading-none tracking-[0.04em] text-muted-foreground",
};
