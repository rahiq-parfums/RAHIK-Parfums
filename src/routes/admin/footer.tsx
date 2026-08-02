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
  AdminTextarea,
  AdminButton,
  AdminSectionTitle,
} from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/footer")({
  head: () => ({ meta: [{ title: "Footer Settings — Admin" }] }),
  component: AdminFooterPage,
});

type FooterSettings = {
  brand_name: string;
  description_ar: string;
  description_en: string;
  copyright_year: number;
  copyright_text: string;
  show_instagram: boolean;
  show_facebook: boolean;
  show_tiktok: boolean;
  show_telegram: boolean;
  show_whatsapp: boolean;
};

const defaults: FooterSettings = {
  brand_name: "RAHIQ Parfums",
  description_ar: "",
  description_en: "",
  copyright_year: new Date().getFullYear(),
  copyright_text: "All Rights Reserved",
  show_instagram: true,
  show_facebook: true,
  show_tiktok: true,
  show_telegram: true,
  show_whatsapp: true,
};

function AdminFooterPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FooterSettings>(defaults);
  const [dirty, setDirty] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-footer-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("footer_settings").select("*").eq("id", 1).maybeSingle();
      return data as FooterSettings | null;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({ ...defaults, ...data });
    }
  }, [data]);

  function update(patch: Partial<FooterSettings>) {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("footer_settings")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-footer-settings"] });
      setDirty(false);
    },
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Footer Settings"
        description="Controls the footer that appears on every public page."
      />

      <div className="space-y-6">
        <AdminCard>
          <AdminSectionTitle>Brand</AdminSectionTitle>
          <div className="space-y-4">
            <AdminField label="Brand Name">
              <AdminInput value={form.brand_name} onChange={(e) => update({ brand_name: e.target.value })} />
            </AdminField>
            <AdminField label="Footer Description (Arabic)">
              <AdminTextarea value={form.description_ar} onChange={(e) => update({ description_ar: e.target.value })} dir="rtl" placeholder="Short brand tagline in Arabic..." />
            </AdminField>
            <AdminField label="Footer Description (English)">
              <AdminTextarea value={form.description_en} onChange={(e) => update({ description_en: e.target.value })} placeholder="Short brand tagline in English..." />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle>Copyright</AdminSectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminField label="Copyright Year">
              <AdminInput type="number" value={form.copyright_year} onChange={(e) => update({ copyright_year: Number(e.target.value) })} />
            </AdminField>
            <AdminField label="Copyright Text">
              <AdminInput value={form.copyright_text} onChange={(e) => update({ copyright_text: e.target.value })} />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard>
          <AdminSectionTitle>Social Icons in Footer</AdminSectionTitle>
          <div className="space-y-3">
            {[
              { key: "show_instagram" as const, label: "Instagram" },
              { key: "show_facebook" as const, label: "Facebook" },
              { key: "show_tiktok" as const, label: "TikTok" },
              { key: "show_telegram" as const, label: "Telegram" },
              { key: "show_whatsapp" as const, label: "WhatsApp" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </AdminCard>

        <div className="flex items-center gap-3">
          <AdminButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !dirty}>
            {saveMutation.isPending ? "Saving..." : "Save Footer Settings"}
          </AdminButton>
          {saveMutation.isSuccess && !dirty && (
            <span className="text-xs text-green-600 font-medium">Saved successfully</span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
