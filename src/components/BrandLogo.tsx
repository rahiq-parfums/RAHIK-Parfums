import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const LOCAL_LOGO = "/images/logo/logo.png";
const DEFAULT_BRAND_NAME = "RAHIQ Parfums";

type BrandSettings = {
  logo_url: string;
  brand_name_ar: string;
  brand_name_en: string;
};

function useBrandSettings() {
  return useQuery({
    queryKey: ["brand-settings-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("logo_url, brand_name_ar, brand_name_en")
        .eq("id", 1)
        .maybeSingle();
      return data as BrandSettings | null;
    },
    staleTime: 60_000,
  });
}

export function BrandLogo({ className = "h-10 w-auto" }: { className?: string }) {
  const { data } = useBrandSettings();
  const src = data?.logo_url || LOCAL_LOGO;
  const alt = data?.brand_name_en || DEFAULT_BRAND_NAME;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

/**
 * The official brand name. Always rendered exactly as provided, on one line,
 * with a single shared type size for both scripts.
 */
export function BrandName({ className = "" }: { className?: string }) {
  const { data } = useBrandSettings();

  return (
    <span
      dir="ltr"
      className={`whitespace-nowrap font-bold tracking-[0.1em] text-foreground ${className}`}
    >
      {data?.brand_name_en || DEFAULT_BRAND_NAME}
    </span>
  );
}
