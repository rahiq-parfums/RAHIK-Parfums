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
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Perfumes — Admin" }] }),
  component: AdminProductsPage,
});

type PerfumeRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  main_image: string;
  rating_spring: number;
  rating_summer: number;
  rating_autumn: number;
  rating_winter: number;
  rating_day: number;
  rating_night: number;
  rating_loved: number;
  rating_good: number;
  rating_not_recommended: number;
  community_score: number;
  is_visible: boolean;
  display_order: number;
  versions?: { id: string; label_ar: string; label_en: string; display_order: number }[];
  gallery?: { id: string; image_url: string; display_order: number }[];
};

type VersionDraft = { id?: string; label_ar: string; label_en: string };
type GalleryDraft = { id?: string; image_url: string };

const emptyPerfume = (): Partial<PerfumeRow> => ({
  slug: "",
  name_ar: "",
  name_en: "",
  desc_ar: "",
  desc_en: "",
  main_image: "",
  rating_spring: 50,
  rating_summer: 50,
  rating_autumn: 50,
  rating_winter: 50,
  rating_day: 50,
  rating_night: 50,
  rating_loved: 50,
  rating_good: 40,
  rating_not_recommended: 10,
  community_score: 80,
  is_visible: true,
  display_order: 0,
});

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-xs text-muted-foreground shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <span className="w-10 text-right text-sm tabular-nums text-foreground">{value}%</span>
    </div>
  );
}

function AdminProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<PerfumeRow> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [versions, setVersions] = useState<VersionDraft[]>([]);
  const [gallery, setGallery] = useState<GalleryDraft[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<PerfumeRow | null>(null);
  const [search, setSearch] = useState("");

  const { data: perfumes = [], isLoading } = useQuery({
    queryKey: ["admin-perfumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfumes")
        .select("*, versions:perfume_versions(*), gallery:perfume_gallery(*)")
        .order("display_order");
      if (error) throw error;
      return data as PerfumeRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const slug = editing.slug || `perfume-${Date.now()}`;
      const payload = { ...editing, slug };

      let perfumeId = editing.id;
      if (isNew) {
        const { data, error } = await supabase.from("perfumes").insert(payload).select("id").single();
        if (error) throw error;
        perfumeId = data.id;
      } else {
        const { error } = await supabase.from("perfumes").update(payload).eq("id", editing.id!);
        if (error) throw error;
      }

      // Sync versions
      await supabase.from("perfume_versions").delete().eq("perfume_id", perfumeId!);
      if (versions.length > 0) {
        await supabase.from("perfume_versions").insert(
          versions.map((v, i) => ({ perfume_id: perfumeId, label_ar: v.label_ar, label_en: v.label_en, display_order: i }))
        );
      }

      // Sync gallery
      await supabase.from("perfume_gallery").delete().eq("perfume_id", perfumeId!);
      if (gallery.length > 0) {
        await supabase.from("perfume_gallery").insert(
          gallery.map((g, i) => ({ perfume_id: perfumeId, image_url: g.image_url, display_order: i }))
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-perfumes"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("perfumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-perfumes"] });
      setDeleteTarget(null);
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase.from("perfumes").update({ is_visible }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-perfumes"] }),
  });

  function startAdd() {
    setIsNew(true);
    setEditing(emptyPerfume());
    setVersions([]);
    setGallery([]);
  }

  function startEdit(p: PerfumeRow) {
    setIsNew(false);
    setEditing({ ...p });
    setVersions(p.versions?.map((v) => ({ id: v.id, label_ar: v.label_ar, label_en: v.label_en })) ?? []);
    setGallery(p.gallery?.map((g) => ({ id: g.id, image_url: g.image_url })) ?? []);
  }

  function startDuplicate(p: PerfumeRow) {
    setIsNew(true);
    setEditing({ ...p, id: undefined, slug: `${p.slug}-copy`, name_ar: `${p.name_ar} (نسخة)`, name_en: `${p.name_en} (Copy)` });
    setVersions(p.versions?.map((v) => ({ label_ar: v.label_ar, label_en: v.label_en })) ?? []);
    setGallery(p.gallery?.map((g) => ({ image_url: g.image_url })) ?? []);
  }

  const filtered = perfumes.filter(
    (p) =>
      p.name_ar.toLowerCase().includes(search.toLowerCase()) ||
      p.name_en.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Perfumes"
        description="Manage your fragrance catalogue."
        action={
          <AdminButton onClick={startAdd}>
            <Plus className="h-4 w-4" /> Add Perfume
          </AdminButton>
        }
      />

      <div className="mb-4">
        <AdminInput
          placeholder="Search perfumes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Edit / Add form */}
      {editing && (
        <AdminCard className="mb-6">
          <h2 className="mb-5 text-base font-semibold text-foreground">
            {isNew ? "Add New Perfume" : "Edit Perfume"}
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Name (Arabic)" required>
                <AdminInput
                  value={editing.name_ar ?? ""}
                  onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                  dir="rtl"
                />
              </AdminField>
              <AdminField label="Name (English)" required>
                <AdminInput
                  value={editing.name_en ?? ""}
                  onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                />
              </AdminField>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Description (Arabic)">
                <AdminTextarea
                  value={editing.desc_ar ?? ""}
                  onChange={(e) => setEditing({ ...editing, desc_ar: e.target.value })}
                  dir="rtl"
                />
              </AdminField>
              <AdminField label="Description (English)">
                <AdminTextarea
                  value={editing.desc_en ?? ""}
                  onChange={(e) => setEditing({ ...editing, desc_en: e.target.value })}
                />
              </AdminField>
            </div>
            <AdminField label="Main Image URL">
              <AdminInput
                value={editing.main_image ?? ""}
                onChange={(e) => setEditing({ ...editing, main_image: e.target.value })}
                placeholder="https://..."
              />
              {editing.main_image && (
                <img src={editing.main_image} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />
              )}
            </AdminField>
            <AdminField label="URL Slug">
              <AdminInput
                value={editing.slug ?? ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="e.g. oud-royal"
              />
            </AdminField>

            {/* Gallery */}
            <AdminField label="Gallery Images">
              <div className="space-y-2">
                {gallery.map((g, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <AdminInput
                      value={g.image_url}
                      onChange={(e) => {
                        const next = [...gallery];
                        next[i] = { ...g, image_url: e.target.value };
                        setGallery(next);
                      }}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </AdminButton>
                  </div>
                ))}
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setGallery([...gallery, { image_url: "" }])}
                >
                  <Plus className="h-3 w-3" /> Add Image
                </AdminButton>
              </div>
            </AdminField>

            {/* Versions */}
            <AdminField label="Available Versions">
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <AdminInput
                      value={v.label_ar}
                      onChange={(e) => {
                        const next = [...versions];
                        next[i] = { ...v, label_ar: e.target.value };
                        setVersions(next);
                      }}
                      placeholder="Arabic label"
                      dir="rtl"
                      className="flex-1"
                    />
                    <AdminInput
                      value={v.label_en}
                      onChange={(e) => {
                        const next = [...versions];
                        next[i] = { ...v, label_en: e.target.value };
                        setVersions(next);
                      }}
                      placeholder="English label"
                      className="flex-1"
                    />
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => setVersions(versions.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </AdminButton>
                  </div>
                ))}
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setVersions([...versions, { label_ar: "", label_en: "" }])}
                >
                  <Plus className="h-3 w-3" /> Add Version
                </AdminButton>
              </div>
            </AdminField>

            {/* Ratings */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Season Ratings
              </p>
              <div className="space-y-2.5">
                <RatingRow label="Spring" value={editing.rating_spring ?? 50} onChange={(v) => setEditing({ ...editing, rating_spring: v })} />
                <RatingRow label="Summer" value={editing.rating_summer ?? 50} onChange={(v) => setEditing({ ...editing, rating_summer: v })} />
                <RatingRow label="Autumn" value={editing.rating_autumn ?? 50} onChange={(v) => setEditing({ ...editing, rating_autumn: v })} />
                <RatingRow label="Winter" value={editing.rating_winter ?? 50} onChange={(v) => setEditing({ ...editing, rating_winter: v })} />
              </div>
              <p className="mb-3 mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Time of Day
              </p>
              <div className="space-y-2.5">
                <RatingRow label="Day" value={editing.rating_day ?? 50} onChange={(v) => setEditing({ ...editing, rating_day: v })} />
                <RatingRow label="Night" value={editing.rating_night ?? 50} onChange={(v) => setEditing({ ...editing, rating_night: v })} />
              </div>
              <p className="mb-3 mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Community Reactions
              </p>
              <div className="space-y-2.5">
                <RatingRow label="Loved it" value={editing.rating_loved ?? 50} onChange={(v) => setEditing({ ...editing, rating_loved: v })} />
                <RatingRow label="Good" value={editing.rating_good ?? 40} onChange={(v) => setEditing({ ...editing, rating_good: v })} />
                <RatingRow label="Not Recommended" value={editing.rating_not_recommended ?? 10} onChange={(v) => setEditing({ ...editing, rating_not_recommended: v })} />
                <RatingRow label="Community Score" value={editing.community_score ?? 80} onChange={(v) => setEditing({ ...editing, community_score: v })} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AdminField label="Display Order">
                <AdminInput
                  type="number"
                  value={editing.display_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                />
              </AdminField>
              <AdminField label="Visibility">
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_visible ?? true}
                    onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Visible on website</span>
                </label>
              </AdminField>
            </div>

            <div className="flex gap-3 pt-1">
              <AdminButton
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving..." : "Save Perfume"}
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </AdminButton>
              {saveMutation.isError && (
                <span className="text-sm text-red-600">Failed to save. Try again.</span>
              )}
            </div>
          </div>
        </AdminCard>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <p className="text-center text-sm text-muted-foreground py-8">
            {search ? "No perfumes match your search." : "No perfumes yet. Add your first one."}
          </p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <AdminCard key={p.id} className="flex items-center gap-4">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              {p.main_image && (
                <img src={p.main_image} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {p.name_ar} / {p.name_en}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.versions?.length ?? 0} versions · Score {p.community_score}%
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <AdminBadge variant={p.is_visible ? "success" : "default"}>
                  {p.is_visible ? "Visible" : "Hidden"}
                </AdminBadge>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  title={p.is_visible ? "Hide" : "Show"}
                  onClick={() => toggleVisibility.mutate({ id: p.id, is_visible: !p.is_visible })}
                >
                  {p.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => startDuplicate(p)} title="Duplicate">
                  <Copy className="h-3.5 w-3.5" />
                </AdminButton>
                <AdminButton variant="ghost" size="sm" onClick={() => startEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </AdminButton>
                <AdminButton variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Perfume"
          message={`Are you sure you want to delete "${deleteTarget.name_en}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
