import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AdminLayout, AdminCard, AdminPageHeader } from "@/components/admin/AdminLayout";
import { Sparkles, Gift, Tag, Truck, MapPin, Phone, Settings, CircleCheck as CheckCircle, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — RAHIQ Parfums" }] }),
  component: AdminDashboardPage,
});

function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [perfumes, offers, discounts, wilayas, municipalities, contact, brand] = await Promise.all([
        supabase.from("perfumes").select("id", { count: "exact", head: true }),
        supabase.from("offers").select("id", { count: "exact", head: true }),
        supabase.from("discounts").select("id", { count: "exact", head: true }).eq("is_enabled", true),
        supabase.from("wilayas").select("id", { count: "exact", head: true }),
        supabase.from("municipalities").select("id", { count: "exact", head: true }),
        supabase.from("contact_settings").select("email").maybeSingle(),
        supabase.from("brand_settings").select("brand_name_en").maybeSingle(),
      ]);
      return {
        perfumes: perfumes.count ?? 0,
        offers: offers.count ?? 0,
        activeDiscounts: discounts.count ?? 0,
        wilayas: wilayas.count ?? 0,
        municipalities: municipalities.count ?? 0,
        contactConfigured: !!(contact.data?.email),
        brandConfigured: !!(brand.data?.brand_name_en),
      };
    },
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  to,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  to: string;
  color?: "blue" | "green" | "amber" | "purple" | "rose" | "teal";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <Link to={to}>
      <AdminCard className="hover:border-primary/30 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </AdminCard>
    </Link>
  );
}

function StatusCard({ label, configured, to }: { label: string; configured: boolean; to: string }) {
  return (
    <Link to={to}>
      <AdminCard className="hover:border-primary/30 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {configured ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Configured
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <Clock className="h-3.5 w-3.5" /> Needs setup
            </span>
          )}
        </div>
      </AdminCard>
    </Link>
  );
}

function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your RAHIQ Parfums website content."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Perfumes" value={data?.perfumes ?? 0} icon={Sparkles} to="/admin/products" color="blue" />
            <StatCard label="Total Offers" value={data?.offers ?? 0} icon={Gift} to="/admin/offers" color="teal" />
            <StatCard label="Active Discounts" value={data?.activeDiscounts ?? 0} icon={Tag} to="/admin/discounts" color="rose" />
            <StatCard label="Wilayas" value={data?.wilayas ?? 0} icon={MapPin} to="/admin/algeria" color="amber" />
            <StatCard label="Municipalities" value={data?.municipalities ?? 0} icon={Truck} to="/admin/algeria" color="green" />
            <StatCard label="Delivery Zones" value={`${data?.wilayas ?? 0} zones`} icon={Truck} to="/admin/delivery" color="purple" />
          </div>

          <h2 className="mt-8 mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration Status
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatusCard label="Contact Information" configured={data?.contactConfigured ?? false} to="/admin/contacts" />
            <StatusCard label="Brand Settings" configured={data?.brandConfigured ?? false} to="/admin/settings" />
            <StatusCard label="Email Settings" configured={false} to="/admin/email" />
            <StatusCard label="Footer Settings" configured={false} to="/admin/footer" />
          </div>
        </>
      )}
    </AdminLayout>
  );
}
