import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AdminLayout,
  AdminPageHeader,
  AdminCard,
  AdminInput,
  AdminBadge,
} from "@/components/admin/AdminLayout";
import { WILAYAS } from "@/lib/algeria";
import { ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/algeria")({
  head: () => ({ meta: [{ title: "Algeria Data — Admin" }] }),
  component: AdminAlgeriaPage,
});

function AdminAlgeriaPage() {
  const [expandedWilaya, setExpandedWilaya] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredWilayas = WILAYAS.filter(
    (w) =>
      w.nameAr.includes(search) ||
      w.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      w.code.includes(search) ||
      (search.length >= 2 &&
        w.communes.some(
          (m) => m.nameAr.includes(search) || m.nameEn.toLowerCase().includes(search.toLowerCase()),
        )),
  );

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Algeria Administrative Data"
        description="58 wilayas and their municipalities. Sourced from static data — no database edits."
      />

      <div className="mb-4">
        <AdminInput
          placeholder="Search wilayas or municipalities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-2">
        {filteredWilayas.map((w) => {
          const isExpanded = expandedWilaya === w.code;
          const munis = w.communes;
          const filteredMunis = search.length >= 2
            ? munis.filter(
                (m) => m.nameAr.includes(search) || m.nameEn.toLowerCase().includes(search.toLowerCase()),
              )
            : munis;

          return (
            <AdminCard key={w.code} className="py-3">
              <button
                className="flex w-full items-center gap-3 text-left"
                onClick={() => setExpandedWilaya(isExpanded ? null : w.code)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs font-mono text-muted-foreground w-6">{w.code}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{w.nameAr}</span>
                <span className="text-xs text-muted-foreground">{munis.length} municipalities</span>
              </button>

              {isExpanded && (
                <div className="mt-3 ml-10 space-y-1.5 border-t border-border pt-3">
                  {filteredMunis.map((m) => (
                    <div key={m.nameAr} className="flex items-center gap-3">
                      <span className="flex-1 text-sm text-foreground">{m.nameAr}</span>
                      <AdminBadge variant="success">Active</AdminBadge>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          );
        })}
      </div>
    </AdminLayout>
  );
}
