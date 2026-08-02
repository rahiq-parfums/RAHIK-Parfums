import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  AdminLayout,
  AdminPageHeader,
  AdminCard,
  AdminField,
  AdminInput,
  AdminButton,
  AdminSectionTitle,
} from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Brand Settings — Admin" }] }),
  component: AdminSettingsPage,
});

type BrandSettings = {
  logo_url: string;
  hero_logo_url: string;
  favicon_url: string;
  brand_name_ar: string;
  brand_name_en: string;
  default_language: string;
  hero_desc_ar: string;
  hero_desc_en: string;
};

const defaults: BrandSettings = {
  logo_url: "/images/logo/logo.png",
  hero_logo_url: "",
  favicon_url: "/favicon.svg",
  brand_name_ar: "رحيق",
  brand_name_en: "RAHIQ Parfums",
  default_language: "ar",
  hero_desc_ar: "",
  hero_desc_en: "",
};

function AdminSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<BrandSettings>(defaults);
  const [dirty, setDirty] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-brand-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("brand_settings").select("*").eq("id", 1).maybeSingle();
      return data as BrandSettings | null;
    },
  });

  useEffect(() => {
    if (data) setForm({ ...defaults, ...data });
  }, [data]);

  function update(patch: Partial<BrandSettings>) {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("brand_settings")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-brand-settings"] });
      setDirty(false);
    },
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Brand Settings"
        description="Controls the brand identity across the entire website."
      />

      <div className="space-y-6">
        <AdminCard>
          <AdminSectionTitle>Brand Identity</AdminSectionTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminField label="Brand Name (Arabic)">
                <AdminInput value={form.brand_name_ar} onChange={(e) => update({ brand_name_ar: e.target.value })} dir="rtl" />
              </AdminField>
              <AdminField label="Brand Name (English)">
                <AdminInput value={form.brand_name_en} onChange={(e) => update({ brand_name_en: e.target.value })} />
              </AdminField>
            </div>
            <AdminField label="Default Language">
              <select
                value={form.default_language}
                onChange={(e) => update({ default_language: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="ar">Arabic (العربية)</option>
                <option value="en">English</option>
              </select>
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle>Hero Description</AdminSectionTitle>
          <div className="space-y-4">
            <AdminField label="Hero Description (Arabic)">
              <AdminInput value={form.hero_desc_ar} onChange={(e) => update({ hero_desc_ar: e.target.value })} dir="rtl" placeholder="Tagline shown on the homepage hero..." />
            </AdminField>
            <AdminField label="Hero Description (English)">
              <AdminInput value={form.hero_desc_en} onChange={(e) => update({ hero_desc_en: e.target.value })} placeholder="Tagline shown on the homepage hero..." />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle>Media Assets</AdminSectionTitle>
          <div className="space-y-4">
            <AdminField label="Logo URL">
              <AdminInput value={form.logo_url} onChange={(e) => update({ logo_url: e.target.value })} dir="ltr" placeholder="/images/logo/logo.png" />
              {form.logo_url && (
                <img src={form.logo_url} alt="Logo" className="mt-2 h-12 w-auto rounded" />
              )}
            </AdminField>
            <AdminField label="Hero Logo URL">
              <AdminInput value={form.hero_logo_url} onChange={(e) => update({ hero_logo_url: e.target.value })} dir="ltr" placeholder="/images/logo/logo.png" />
            </AdminField>
            <AdminField label="Favicon URL">
              <AdminInput value={form.favicon_url} onChange={(e) => update({ favicon_url: e.target.value })} dir="ltr" placeholder="/favicon.svg" />
              {form.favicon_url && (
                <img src={form.favicon_url} alt="Favicon" className="mt-2 h-8 w-8 rounded" />
              )}
            </AdminField>
          </div>
        </AdminCard>

        <div className="flex items-center gap-3">
          <AdminButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !dirty}>
            {saveMutation.isPending ? "Saving..." : "Save Brand Settings"}
          </AdminButton>
          {saveMutation.isSuccess && !dirty && (
            <span className="text-xs text-green-600 font-medium">Saved successfully</span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
