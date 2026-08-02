import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  AdminLayout,
  AdminPageHeader,
  AdminCard,
  AdminInput,
  AdminButton,
  ConfirmDialog,
} from "@/components/admin/AdminLayout";
import { Trash2, Copy, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media Library — Admin" }] }),
  component: AdminMediaPage,
});

type MediaRow = {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  file_size: number | null;
  created_at: string;
};

function AdminMediaPage() {
  const qc = useQueryClient();
  const [addUrl, setAddUrl] = useState("");
  const [addFilename, setAddFilename] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MediaRow[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!addUrl.trim()) return;
      const { error } = await supabase.from("media_library").insert({
        url: addUrl.trim(),
        filename: addFilename.trim() || addUrl.trim().split("/").pop() || "image",
        mime_type: "image/jpeg",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      setAddUrl("");
      setAddFilename("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_library").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      setDeleteTarget(null);
    },
  });

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = media.filter(
    (m) =>
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.url.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Media Library"
        description="Centralised image registry. Add URL references for use across the dashboard."
      />

      <AdminCard className="mb-6">
        <p className="mb-3 text-sm font-medium text-foreground">Add Image by URL</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <AdminInput
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          <AdminInput
            value={addFilename}
            onChange={(e) => setAddFilename(e.target.value)}
            placeholder="Filename (optional)"
            className="w-40"
          />
          <AdminButton
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending || !addUrl.trim()}
          >
            <Plus className="h-4 w-4" />
            {addMutation.isPending ? "Adding..." : "Add"}
          </AdminButton>
        </div>
      </AdminCard>

      <div className="mb-4">
        <AdminInput
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <p className="text-center text-sm text-muted-foreground py-8">
            {search ? "No media matches your search." : "No images yet. Add one above."}
          </p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((m) => (
            <div key={m.id} className="group relative rounded-xl border border-border overflow-hidden bg-muted/20">
              <img
                src={m.url}
                alt={m.filename}
                className="aspect-square w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2394a3b8' font-size='12'%3ENo image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2">
                <p className="text-white text-xs font-medium truncate mb-1">{m.filename}</p>
                <div className="flex gap-1.5">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(m.url, m.id)}
                    className="bg-white/20 text-white border-white/20 hover:bg-white/30 hover:text-white text-xs py-1 px-2"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === m.id ? "Copied!" : "Copy"}
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(m)}
                    className="bg-red-500/20 text-white border-red-500/20 hover:bg-red-500/40 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </AdminButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove from Library"
          message={`Remove "${deleteTarget.filename}" from the media library? This does not delete the original image.`}
          confirmLabel="Remove"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
