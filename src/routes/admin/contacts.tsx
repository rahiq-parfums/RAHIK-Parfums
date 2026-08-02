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
} from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contact Info — Admin" }] }),
  component: AdminContactsPage,
});

type ContactSettings = {
  instagram: string;
  facebook: string;
  tiktok: string;
  telegram: string;
  whatsapp: string;
  email: string;
  phone: string;
  business_hours: string;
};

const defaults: ContactSettings = {
  instagram: "",
  facebook: "",
  tiktok: "",
  telegram: "",
  whatsapp: "",
  email: "",
  phone: "",
  business_hours: "",
};

const FIELDS: { field: keyof ContactSettings; label: string; placeholder: string }[] = [
  { field: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
  { field: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
  { field: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@..." },
  { field: "telegram", label: "Telegram URL", placeholder: "https://t.me/..." },
  { field: "whatsapp", label: "WhatsApp URL", placeholder: "https://wa.me/213..." },
  { field: "email", label: "Email Address", placeholder: "contact@rahiqparfums.dz" },
  { field: "phone", label: "Phone Number", placeholder: "+213 ..." },
  { field: "business_hours", label: "Business Hours", placeholder: "Mon–Fri 9am–6pm" },
];

function AdminContactsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ContactSettings>(defaults);
  const [dirty, setDirty] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-contact-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_settings").select("*").eq("id", 1).maybeSingle();
      return data as ContactSettings | null;
    },
  });

  useEffect(() => {
    if (data) setForm({ ...defaults, ...data });
  }, [data]);

  function update(patch: Partial<ContactSettings>) {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("contact_settings")
        .upsert({ id: 1, ...form, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      setDirty(false);
    },
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Contact Information"
        description="All social links and contact details shown on the public website."
      />

      <AdminCard>
        <div className="space-y-4">
          {FIELDS.map(({ field, label, placeholder }) => (
            <AdminField key={field} label={label}>
              <AdminInput
                value={form[field]}
                onChange={(e) => update({ [field]: e.target.value })}
                placeholder={placeholder}
                dir="ltr"
              />
            </AdminField>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <AdminButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !dirty}>
              {saveMutation.isPending ? "Saving..." : "Save Contact Info"}
            </AdminButton>
            {saveMutation.isSuccess && !dirty && (
              <span className="text-xs text-green-600 font-medium">Saved successfully</span>
            )}
            {saveMutation.isError && (
              <span className="text-xs text-red-600">Failed to save. Try again.</span>
            )}
          </div>
        </div>
      </AdminCard>
    </AdminLayout>
  );
}
