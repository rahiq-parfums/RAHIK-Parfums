import { useI18n } from "@/lib/i18n";
import type { Bilingual } from "@/lib/catalog";

/** Resolves a bilingual field to the currently active language. */
export function useLocalized() {
  const { lang } = useI18n();
  return (value: Bilingual) => value[lang];
}
