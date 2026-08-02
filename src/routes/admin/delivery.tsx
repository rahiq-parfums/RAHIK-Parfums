import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { WILAYAS } from "@/lib/algeria";
import {
  AdminLayout,
  AdminPageHeader,
  AdminCard,
  AdminInput,
  AdminButton,
} from "@/components/admin/AdminLayout";
import { Check } from "lucide-react";

export const Route = createFileRoute("/admin/delivery")({
  head: () => ({ meta: [{ title: "Delivery Prices — Admin" }] }),
  component: AdminDeliveryPage,
});

type DeliveryPriceRow = {
  id: string;
  wilaya_code: string;
  home_delivery_price: number;
  office_delivery_price: number;
  free_delivery: boolean;
};

function AdminDeliveryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const { data: prices = [], isLoading } = useQuery({
    queryKey: ["admin-delivery-prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_prices")
        .select("id, wilaya_code, home_delivery_price, office_delivery_price, free_delivery")
        .order("wilaya_code");
      if (error) throw error;
      return data as DeliveryPriceRow[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      home_delivery_price,
      office_delivery_price,
      free_delivery,
    }: {
      id: string;
      home_delivery_price: number;
      office_delivery_price: number;
      free_delivery: boolean;
    }) => {
      const { error } = await supabase
        .from("delivery_prices")
        .update({ home_delivery_price, office_delivery_price, free_delivery })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-delivery-prices"] });
      setSaved(variables.id);
      setTimeout(() => setSaved(null), 2000);
    },
  });

  const [localPrices, setLocalPrices] = useState<
    Record<string, { home: number; office: number; free: boolean }>
  >({});

  function getPrice(p: DeliveryPriceRow) {
    return localPrices[p.id] ?? { home: p.home_delivery_price, office: p.office_delivery_price, free: p.free_delivery };
  }

  function updateLocal(id: string, patch: Partial<{ home: number; office: number; free: boolean }>) {
    const row = prices.find((p) => p.id === id);
    if (!row) return;
    setLocalPrices((prev) => ({
      ...prev,
      [id]: { ...getPrice(row), ...patch },
    }));
  }

  function savePrice(p: DeliveryPriceRow) {
    const val = getPrice(p);
    updateMutation.mutate({
      id: p.id,
      home_delivery_price: val.home,
      office_delivery_price: val.office,
      free_delivery: val.free,
    });
  }

  const wilayaNameByCode = (code: string) => {
    const w = WILAYAS.find((w) => w.code === code);
    return w ? w.nameAr : code;
  };

  const filtered = prices.filter(
    (p) => {
      const name = wilayaNameByCode(p.wilaya_code);
      return name.includes(search) || p.wilaya_code.includes(search);
    },
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Delivery Prices"
        description="Set home and office delivery prices per wilaya."
      />

      <div className="mb-4">
        <AdminInput
          placeholder="Search by wilaya name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const val = getPrice(p);
            const isSaving = updateMutation.isPending && updateMutation.variables?.id === p.id;
            const isSaved = saved === p.id;
            return (
              <AdminCard key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center py-3">
                <span className="w-40 shrink-0 text-sm text-foreground font-medium">
                  <span className="text-muted-foreground text-xs">{p.wilaya_code}</span>{" "}
                  {wilayaNameByCode(p.wilaya_code)}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Home (DA)</span>
                    <AdminInput
                      type="number"
                      value={val.home}
                      onChange={(e) => updateLocal(p.id, { home: Number(e.target.value) })}
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Office (DA)</span>
                    <AdminInput
                      type="number"
                      value={val.office}
                      onChange={(e) => updateLocal(p.id, { office: Number(e.target.value) })}
                      className="w-24"
                    />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val.free}
                      onChange={(e) => updateLocal(p.id, { free: e.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-xs text-muted-foreground">Free</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isSaved && <Check className="h-4 w-4 text-green-600" />}
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => savePrice(p)}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </AdminButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
