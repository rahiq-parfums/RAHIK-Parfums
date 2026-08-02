import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  AdminLayout,
  AdminCard,
  AdminPageHeader,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminButton,
  AdminBadge,
  ConfirmDialog,
} from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff, GripVertical, Star } from "lucide-react";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({ meta: [{ title: "Offers — Admin" }] }),
  component: AdminOffersPage,
});

type OfferRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  long_desc_ar: string;
  long_desc_en: string;
  main_image: string;
  regular_price: number;
  max_quantity: number;
  free_delivery: boolean;
  is_featured: boolean;
  is_visible: boolean;
  display_order: number;
  gallery?: { id: string; image_url: string }[];
  includes?: { id: string; label_ar: string; label_en: string }[];
  perfumes?: { id: string; name_ar: string; name_en: string; image_url: string; desc_ar: string; desc_en: string }[];
};

const emptyOffer = (): Partial<OfferRow> => ({
  slug: "",
  title_ar: "",
  title_en: "",
  desc_ar: "",
  desc_en: "",
  long_desc_ar: "",
  long_desc_en: "",
  main_image: "",
  regular_price: 0,
  max_quantity: 99,
  free_delivery: false,
  is_featured: false,
  is_visible: true,
  display_order: 0,
});

function AdminOffersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<OfferRow> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [gallery, setGallery] = useState<{ image_url: string }[]>([]);
  const [includes, setIncludes] = useState<{ label_ar: string; label_en: string }[]>([]);
  const [offerPerfumes, setOfferPerfumes] = useState<{
    name_ar: string; name_en: string; image_url: string; desc_ar: string; desc_en: string;
  }[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<OfferRow | null>(null);
  const [search, setSearch] = useState("");

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*, gallery:offer_gallery(*), includes:offer_includes(*), perfumes:offer_perfumes(*)")
        .order("display_order");
      if (error) throw error;
      return data as OfferRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const slug = editing.slug || `offer-${Date.now()}`;
      const payload = { ...editing, slug };
      let offerId = editing.id;

      if (isNew) {
        const { data, error } = await supabase.from("offers").insert(payload).select("id").single();
        if (error) throw error;
        offerId = data.id;
      } else {
        const { error } = await supabase.from("offers").update(payload).eq("id", editing.id!);
        if (error) throw error;
      }

      await supabase.from("offer_gallery").delete().eq("offer_id", offerId!);
      if (gallery.length > 0) {
        await supabase.from("offer_gallery").insert(
          gallery.map((g, i) => ({ offer_id: offerId, image_url: g.image_url, display_order: i }))
        );
      }

      await supabase.from("offer_includes").delete().eq("offer_id", offerId!);
      if (includes.length > 0) {
        await supabase.from("offer_includes").insert(
          includes.map((inc, i) => ({ offer_id: offerId, label_ar: inc.label_ar, label_en: inc.label_en, display_order: i }))
        );
      }

      await supabase.from("offer_perfumes").delete().eq("offer_id", offerId!);
      if (offerPerfumes.length > 0) {
        await supabase.from("offer_perfumes").insert(
          offerPerfumes.map((op, i) => ({
            offer_id: offerId,
            name_ar: op.name_ar,
            name_en: op.name_en,
            image_url: op.image_url,
            desc_ar: op.desc_ar,
            desc_en: op.desc_en,
            display_order: i,
          }))
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-offers"] });
      setDeleteTarget(null);
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase.from("offers").update({ is_visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-offers"] }),
  });

  function startAdd() {
    setIsNew(true);
    setEditing(emptyOffer());
    setGallery([]);
    setIncludes([]);
    setOfferPerfumes([]);
  }

  function startEdit(o: OfferRow) {
    setIsNew(false);
    setEditing({ ...o });
    setGallery(o.gallery?.map((g) => ({ image_url: g.image_url })) ?? []);
    setIncludes(o.includes?.map((inc) => ({ label_ar: inc.label_ar, label_en: inc.label_en })) ?? []);
    setOfferPerfumes(o.perfumes?.map((p) => ({ name_ar: p.name_ar, name_en: p.name_en, image_url: p.image_url, desc_ar: p.desc_ar, desc_en: p.desc_en })) ?? []);
  }

  function startDuplicate(o: OfferRow) {
    setIsNew(true);
    setEditing({ ...o, id: undefined, slug: `${o.slug}-copy`, title_ar: `${o.title_ar} (نسخة)`, title_en: `${o.title_en} (Copy)` });
    setGallery(o.gallery?.map((g) => ({ image_url: g.image_url })) ?? []);
    setIncludes(o.includes?.map((inc) => ({ label_ar: inc.label_ar, label_en: inc.label_en })) ?? []);
    setOfferPerfumes(o.perfumes?.map((p) => ({ name_ar: p.name_ar, name_en: p.name_en, image_url: p.image_url, desc_ar: p.desc_ar, desc_en: p.desc_en })) ?? []);
  }

  const filtered = offers.filter(
    (o) =>
      o.title_ar.toLowerCase().includes(search.toLowerCase()) ||
      o.title_en.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Offers"
        description="Manage offer packages and bundles."
        action={
          <AdminButton onClick={startAdd}>
            <Plus className="h-4 w-4" /> Add Offer
          </AdminButton>
        }
      />

      <div className="mb-4">
        <AdminInput
          placeholder="Search offers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {editing && (
        <AdminCard className="mb-6">
          <h2 className="mb-5 text-base font-semibold text-foreground">
            {isNew ? "Add New Offer" : "Edit Offer"}
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Title (Arabic)" required>
                <AdminInput value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} dir="rtl" />
              </AdminField>
              <AdminField label="Title (English)" required>
                <AdminInput value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
              </AdminField>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Description (Arabic)">
                <AdminTextarea value={editing.desc_ar ?? ""} onChange={(e) => setEditing({ ...editing, desc_ar: e.target.value })} dir="rtl" />
              </AdminField>
              <AdminField label="Description (English)">
                <AdminTextarea value={editing.desc_en ?? ""} onChange={(e) => setEditing({ ...editing, desc_en: e.target.value })} />
              </AdminField>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Long Description (Arabic)">
                <AdminTextarea value={editing.long_desc_ar ?? ""} onChange={(e) => setEditing({ ...editing, long_desc_ar: e.target.value })} dir="rtl" />
              </AdminField>
              <AdminField label="Long Description (English)">
                <AdminTextarea value={editing.long_desc_en ?? ""} onChange={(e) => setEditing({ ...editing, long_desc_en: e.target.value })} />
              </AdminField>
            </div>

            <AdminField label="Main Image URL">
              <AdminInput value={editing.main_image ?? ""} onChange={(e) => setEditing({ ...editing, main_image: e.target.value })} placeholder="https://..." />
              {editing.main_image && <img src={editing.main_image} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />}
            </AdminField>

            <AdminField label="URL Slug">
              <AdminInput value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="e.g. signature-trio" />
            </AdminField>

            {/* Gallery */}
            <AdminField label="Gallery Images">
              <div className="space-y-2">
                {gallery.map((g, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <AdminInput value={g.image_url} onChange={(e) => { const next = [...gallery]; next[i] = { image_url: e.target.value }; setGallery(next); }} placeholder="https://..." className="flex-1" />
                    <AdminButton variant="danger" size="sm" onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </AdminButton>
                  </div>
                ))}
                <AdminButton variant="ghost" size="sm" onClick={() => setGallery([...gallery, { image_url: "" }])}>
                  <Plus className="h-3 w-3" /> Add Image
                </AdminButton>
              </div>
            </AdminField>

            {/* Includes */}
            <AdminField label="What's Included">
              <div className="space-y-2">
                {includes.map((inc, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <AdminInput value={inc.label_ar} onChange={(e) => { const next = [...includes]; next[i] = { ...inc, label_ar: e.target.value }; setIncludes(next); }} placeholder="Arabic" dir="rtl" className="flex-1" />
                    <AdminInput value={inc.label_en} onChange={(e) => { const next = [...includes]; next[i] = { ...inc, label_en: e.target.value }; setIncludes(next); }} placeholder="English" className="flex-1" />
                    <AdminButton variant="danger" size="sm" onClick={() => setIncludes(includes.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </AdminButton>
                  </div>
                ))}
                <AdminButton variant="ghost" size="sm" onClick={() => setIncludes([...includes, { label_ar: "", label_en: "" }])}>
                  <Plus className="h-3 w-3" /> Add Item
                </AdminButton>
              </div>
            </AdminField>

            {/* Perfumes in offer */}
            <AdminField label="Included Perfumes">
              <div className="space-y-3">
                {offerPerfumes.map((op, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Perfume {i + 1}</span>
                      <AdminButton variant="danger" size="sm" onClick={() => setOfferPerfumes(offerPerfumes.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3" />
                      </AdminButton>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <AdminInput value={op.name_ar} onChange={(e) => { const next = [...offerPerfumes]; next[i] = { ...op, name_ar: e.target.value }; setOfferPerfumes(next); }} placeholder="Name (Arabic)" dir="rtl" />
                      <AdminInput value={op.name_en} onChange={(e) => { const next = [...offerPerfumes]; next[i] = { ...op, name_en: e.target.value }; setOfferPerfumes(next); }} placeholder="Name (English)" />
                      <AdminInput value={op.desc_ar} onChange={(e) => { const next = [...offerPerfumes]; next[i] = { ...op, desc_ar: e.target.value }; setOfferPerfumes(next); }} placeholder="Description (Arabic)" dir="rtl" />
                      <AdminInput value={op.desc_en} onChange={(e) => { const next = [...offerPerfumes]; next[i] = { ...op, desc_en: e.target.value }; setOfferPerfumes(next); }} placeholder="Description (English)" />
                      <AdminInput value={op.image_url} onChange={(e) => { const next = [...offerPerfumes]; next[i] = { ...op, image_url: e.target.value }; setOfferPerfumes(next); }} placeholder="Image URL" className="col-span-2" />
                    </div>
                  </div>
                ))}
                <AdminButton variant="ghost" size="sm" onClick={() => setOfferPerfumes([...offerPerfumes, { name_ar: "", name_en: "", image_url: "", desc_ar: "", desc_en: "" }])}>
                  <Plus className="h-3 w-3" /> Add Perfume
                </AdminButton>
              </div>
            </AdminField>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <AdminField label="Regular Price (DA)" required>
                <AdminInput type="number" value={editing.regular_price ?? 0} onChange={(e) => setEditing({ ...editing, regular_price: Number(e.target.value) })} />
              </AdminField>
              <AdminField label="Max Quantity">
                <AdminInput type="number" value={editing.max_quantity ?? 99} onChange={(e) => setEditing({ ...editing, max_quantity: Number(e.target.value) })} />
              </AdminField>
              <AdminField label="Display Order">
                <AdminInput type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </AdminField>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.free_delivery ?? false} onChange={(e) => setEditing({ ...editing, free_delivery: e.target.checked })} className="h-4 w-4 accent-primary" />
                <span className="text-sm text-foreground">Free Delivery</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="h-4 w-4 accent-primary" />
                <span className="text-sm text-foreground">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} className="h-4 w-4 accent-primary" />
                <span className="text-sm text-foreground">Visible on website</span>
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <AdminButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Offer"}
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setEditing(null)}>Cancel</AdminButton>
              {saveMutation.isError && <span className="text-sm text-red-600">Failed to save.</span>}
            </div>
          </div>
        </AdminCard>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <AdminCard><p className="text-center text-sm text-muted-foreground py-8">No offers yet.</p></AdminCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <AdminCard key={o.id} className="flex items-center gap-4">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              {o.main_image && <img src={o.main_image} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{o.title_ar} / {o.title_en}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {o.regular_price.toLocaleString()} DA
                  {o.free_delivery && " · Free Delivery"}
                  {o.is_featured && " · Featured"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {o.is_featured && <Star className="h-3.5 w-3.5 text-amber-500" />}
                <AdminBadge variant={o.is_visible ? "success" : "default"}>{o.is_visible ? "Visible" : "Hidden"}</AdminBadge>
                <AdminButton variant="ghost" size="sm" onClick={() => toggleVisibility.mutate({ id: o.id, is_visible: !o.is_visible })}>
                  {o.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => startDuplicate(o)} title="Duplicate">
                  <Copy className="h-3.5 w-3.5" />
                </AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => startEdit(o)}>
                  <Pencil className="h-3.5 w-3.5" />
                </AdminButton>
                <AdminButton variant="danger" size="sm" onClick={() => setDeleteTarget(o)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Offer"
          message={`Delete "${deleteTarget.title_en}"? This also removes any associated discount.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
