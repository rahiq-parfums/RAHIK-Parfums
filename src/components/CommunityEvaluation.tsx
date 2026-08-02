import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Flower2,
  Sun,
  Leaf,
  Snowflake,
  Moon,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type RingItem = {
  key: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind text color class for the ring stroke + icon. */
  color: string;
};

const SPRING = "oklch(0.78 0.08 10)";
const SUMMER = "oklch(0.62 0.14 35)";
const AUTUMN = "oklch(0.52 0.09 50)";
const WINTER = "oklch(0.55 0.08 240)";
const DAY = "oklch(0.72 0.12 75)";
const NIGHT = "oklch(0.40 0.06 250)";
const LOVED = "oklch(0.65 0.13 15)";
const LIKED = "oklch(0.60 0.06 200)";
const DISLIKED = "oklch(0.50 0.02 260)";

/**
 * A single circular progress ring with a hollow center, an icon above,
 * the percentage centered inside, and a label below. The ring animates
 * from 0 to its value when scrolled into view.
 */
function CircularRing({
  item,
  label,
  delay,
}: {
  item: RingItem;
  label: string;
  delay: number;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(id);
  }, [visible, delay]);

  const size = 84;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, item.value));
  const offset = animated ? circ * (1 - pct / 100) : circ;
  const Icon = item.icon;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
            opacity={0.45}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={item.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon
            className="h-4 w-4"
            style={{ color: item.color }}
          />
          <span
            className="text-sm font-bold tabular-nums text-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {pct}%
          </span>
        </div>
      </div>
      <span className="text-xs font-normal tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function RingGroup({
  title,
  items,
  labels,
}: {
  title: string;
  items: RingItem[];
  labels: string[];
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-center text-xs font-bold tracking-[0.18em] text-muted-foreground">
        {title}
      </h4>
      <div
        className={cn(
          "flex flex-wrap items-start justify-center gap-x-5 gap-y-5",
          items.length === 2 && "gap-x-8",
        )}
      >
        {items.map((item, i) => (
          <CircularRing
            key={item.key}
            item={item}
            label={labels[i]}
            delay={i * 120}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Premium community evaluation section: three groups of circular progress
 * rings (Seasons, Time, Community Verdict) replacing the old horizontal bars.
 * Data-driven from perfume.ratings — values are percentages 0–100.
 */
export function CommunityEvaluation({
  ratings,
}: {
  ratings: {
    seasons: { spring: number; summer: number; autumn: number; winter: number };
    time: { day: number; night: number };
    community: number;
    reactions: { loved: number; liked: number; disliked: number };
  };
}) {
  const { t } = useI18n();

  const seasonItems: RingItem[] = [
    { key: "spring", value: ratings.seasons.spring, icon: Flower2, color: SPRING },
    { key: "summer", value: ratings.seasons.summer, icon: Sun, color: SUMMER },
    { key: "autumn", value: ratings.seasons.autumn, icon: Leaf, color: AUTUMN },
    { key: "winter", value: ratings.seasons.winter, icon: Snowflake, color: WINTER },
  ];
  const seasonLabels = [
    t("rating.spring"),
    t("rating.summer"),
    t("rating.autumn"),
    t("rating.winter"),
  ];

  const timeItems: RingItem[] = [
    { key: "day", value: ratings.time.day, icon: Sun, color: DAY },
    { key: "night", value: ratings.time.night, icon: Moon, color: NIGHT },
  ];
  const timeLabels = [t("rating.day"), t("rating.night")];

  const reactionItems: RingItem[] = [
    { key: "loved", value: ratings.reactions.loved, icon: Heart, color: LOVED },
    { key: "liked", value: ratings.reactions.liked, icon: ThumbsUp, color: LIKED },
    { key: "disliked", value: ratings.reactions.disliked, icon: ThumbsDown, color: DISLIKED },
  ];
  const reactionLabels = [
    t("rating.loved"),
    t("rating.liked"),
    t("rating.disliked"),
  ];

  return (
    <div className="mt-6 space-y-7">
      <h3 className="text-center text-sm font-bold tracking-[0.14em] text-muted-foreground">
        {t("rating.title")}
      </h3>
      <span className="mx-auto block h-px w-10 bg-primary/50" aria-hidden="true" />
      <div className="space-y-8">
        <RingGroup title={t("rating.seasons")} items={seasonItems} labels={seasonLabels} />
        <RingGroup title={t("rating.time")} items={timeItems} labels={timeLabels} />
        <RingGroup title={t("rating.reactions")} items={reactionItems} labels={reactionLabels} />
      </div>
    </div>
  );
}
