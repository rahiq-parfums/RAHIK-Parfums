import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { toggleLang, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t("lang.label")}
      className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-border px-4 text-sm font-normal tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
    >
      {t("lang.switch")}
    </button>
  );
}
