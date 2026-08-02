import { BrandName } from "@/components/BrandLogo";
import { useI18n } from "@/lib/i18n";
import { useSocialLinks } from "@/lib/social";

export function SiteFooter() {
  const { t } = useI18n();
  const socialLinks = useSocialLinks();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-16">
        <BrandName className="text-sm font-bold" />

        <span className="mx-auto mt-6 block h-px w-10 bg-primary/60" aria-hidden="true" />

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          {socialLinks.map(({ key, href, Icon }) => (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-normal tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs font-normal tracking-[0.16em] text-muted-foreground">
          2026 RAHIQ Parfums — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
