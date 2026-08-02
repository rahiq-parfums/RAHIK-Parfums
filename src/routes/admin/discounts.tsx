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
  AdminButton,
  AdminBadge,
} from "@/components/admin/AdminLayout";
import { Pencil, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/discounts")({
  head: () => ({ meta: [{ title: "Discounts — Admin" }] }),
  component: AdminDiscountsPage,
});

type DiscountRow = {
  id: string;
  offer_id: string;
  is_enabled: boolean;
  old_price: number;
  new_price: number;
  discount_percentage: number;
  start_date: string | null;
  end_date: string | null;
  show_countdown: boolean;
  offers: {
    title_ar: string;
    title_en: string;
    main_image: string;
    regular_price: number;
    slug: string;
  };
};

type DraftDiscount = {
  id: string;
  offer_id: string;
  is_enabled: boolean;
  old_price: number;
  new_price: number;
  start_date: string;
  end_date: string;
  show_countdown: boolean;
};

function AdminDiscountsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<DraftDiscount | null>(null);

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discounts")
        .select("*, offers(title_ar, title_en, main_image, regular_price, slug)")
        .order("created_at");
      if (error) throw error;
      return data as DiscountRow[];
    },
  });

  // Also load offers without a discount so we can create new ones
  const { data: offersWithoutDiscount = [] } = useQuery({
    queryKey: ["offers-without-discount"],
    queryFn: async () => {
      const discountedOfferIds = discounts.map((d) => d.offer_id);
      const { data, error } = await supabase
        .from("offers")
        .select("id, title_ar, title_en, regular_price, main_image")
        .order("display_order");
      if (error) throw error;
      return (data ?? []).filter((o: { id: string }) => !discountedOfferIds.includes(o.id));
    },
    enabled: discounts.length >= 0,
  });

  const saveMutation = useMutation({
    mutationFn: async (draft: DraftDiscount) => {
      const payload = {
        offer_id: draft.offer_id,
        is_enabled: draft.is_enabled,
        old_price: draft.old_price,
        new_price: draft.new_price,
        start_date: draft.start_date || null,
        end_date: draft.end_date || null,
        show_countdown: draft.show_countdown,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("discounts")
        .upsert({ id: draft.id, ...payload });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-discounts"] });
      qc.invalidateQueries({ queryKey: ["offers-without-discount"] });
      setEditing(null);
    },
  });

  const createDiscountMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const offer = offersWithoutDiscount.find((o: { id: string }) => o.id === offerId) as {
        id: string; regular_price: number;
      } | undefined;
      if (!offer) return;
      const { error } = await supabase.from("discounts").insert({
        offer_id: offerId,
        is_enabled: false,
        old_price: offer.regular_price,
        new_price: Math.round(offer.regular_price * 0.8),
        show_countdown: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-discounts"] });
      qc.invalidateQueries({ queryKey: ["offers-without-discount"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("discounts").update({ is_enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });

  function startEdit(d: DiscountRow) {
    setEditing({
      id: d.id,
      offer_id: d.offer_id,
      is_enabled: d.is_enabled,
      old_price: d.old_price,
      new_price: d.new_price,
      start_date: d.start_date ?? "",
      end_date: d.end_date ?? "",
      show_countdown: d.show_countdown,
    });
  }

  const pct = (old_price: number, new_price: number) =>
    old_price > 0 ? Math.round(((old_price - new_price) / old_price) * 100) : 0;

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Discounts"
        description="Add discounts on top of existing offers. One discount per offer."
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />)}</div>
      ) : (
        <>
          {/* Existing discounts */}
          <div className="space-y-3">
            {discounts.map((d) => (
              <AdminCard key={d.id}>
                {editing?.id === d.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{d.offers.title_en}</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editing.is_enabled}
                          onChange={(e) => setEditing({ ...editing, is_enabled: e.target.checked })}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-sm">Enable Discount</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <AdminField label="Old Price (DA)">
                        <AdminInput
                          type="number"
                          value={editing.old_price}
                          onChange={(e) => setEditing({ ...editing, old_price: Number(e.target.value) })}
                        />
                      </AdminField>
                      <AdminField label="New Price (DA)">
                        <AdminInput
                          type="number"
                          value={editing.new_price}
                          onChange={(e) => setEditing({ ...editing, new_price: Number(e.target.value) })}
                        />
                      </AdminField>
                      <AdminField label="Start Date">
                        <AdminInput
                          type="date"
                          value={editing.start_date}
                          onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
                        />
                      </AdminField>
                      <AdminField label="End Date">
                        <AdminInput
                          type="date"
                          value={editing.end_date}
                          onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                        />
                      </AdminField>
                    </div>
                    {editing.old_price > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Discount: <strong className="text-foreground">{pct(editing.old_price, editing.new_price)}%</strong> off
                      </p>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.show_countdown}
                        onChange={(e) => setEditing({ ...editing, show_countdown: e.target.checked })}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">Show countdown timer on website</span>
                    </label>
                    <div className="flex gap-3">
                      <AdminButton onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>
                        <Check className="h-3.5 w-3.5" /> {saveMutation.isPending ? "Saving..." : "Save"}
                      </AdminButton>
                      <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {d.offers.main_image && (
                      <img src={d.offers.main_image} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {d.offers.title_ar} / {d.offers.title_en}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.is_enabled
                          ? `${d.old_price.toLocaleString()} DA → ${d.new_price.toLocaleString()} DA (${pct(d.old_price, d.new_price)}% off)`
                          : "Discount not active"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <AdminBadge variant={d.is_enabled ? "success" : "default"}>
                        {d.is_enabled ? "Active" : "Inactive"}
                      </AdminBadge>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={d.is_enabled}
                          onChange={(e) => toggleMutation.mutate({ id: d.id, is_enabled: e.target.checked })}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                      <AdminButton variant="ghost" size="sm" onClick={() => startEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </AdminButton>
                    </div>
                  </div>
                )}
              </AdminCard>
            ))}
          </div>

          {/* Create discount for offer */}
          {offersWithoutDiscount.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Add discount for an offer without one:
              </p>
              <div className="flex flex-wrap gap-2">
                {offersWithoutDiscount.map((o: { id: string; title_en: string; regular_price: number }) => (
                  <AdminButton
                    key={o.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => createDiscountMutation.mutate(o.id)}
                    disabled={createDiscountMutation.isPending}
                  >
                    + {o.title_en} ({o.regular_price.toLocaleString()} DA)
                  </AdminButton>
                ))}
              </div>
            </div>
          )}

          {discounts.length === 0 && offersWithoutDiscount.length === 0 && (
            <AdminCard>
              <p className="text-center text-sm text-muted-foreground py-8">
                No offers available. Add offers first.
              </p>
            </AdminCard>
          )}
        </>
      )}
    </AdminLayout>
  );
}
