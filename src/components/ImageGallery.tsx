import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A swipeable image gallery with pagination dots only (no thumbnails).
 * Uses native scroll-snap for performance and accessibility.
 */
export function ImageGallery({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          const index = Math.round(el.scrollLeft / el.clientWidth);
          setActive(index);
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-muted"
          >
            <img
              src={src}
              alt={`${alt} — ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                i === active ? "w-8 bg-primary" : "w-2 bg-border",
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
