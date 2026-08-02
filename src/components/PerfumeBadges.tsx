import { useI18n } from "@/lib/i18n";

type VersionLabel = { ar: string; en: string };

export function PerfumeBadges({ versions }: { versions: VersionLabel[] }) {
  const { lang } = useI18n();

  if (!versions || versions.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {versions.map((v, i) => {
        const label = (lang === "ar" ? v.ar : v.en) || v.en || v.ar;
        return (
          <li
            key={i}
            className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-3.5 py-1 text-xs font-normal tracking-[0.1em] text-primary transition-colors"
          >
            {label}
          </li>
        );
      })}
    </ul>
  );
}