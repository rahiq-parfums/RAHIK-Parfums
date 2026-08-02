import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  Gift,
  Tag,
  Truck,
  MapPin,
  Phone,
  PanelBottom,
  Settings,
  Image,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import AdminAuth from "./AdminAuth";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Perfumes", icon: Sparkles, exact: false },
  { to: "/admin/offers", label: "Offers", icon: Gift, exact: false },
  { to: "/admin/discounts", label: "Discounts", icon: Tag, exact: false },
  { to: "/admin/delivery", label: "Delivery Prices", icon: Truck, exact: false },
  { to: "/admin/algeria", label: "Algeria Data", icon: MapPin, exact: false },
  { to: "/admin/contacts", label: "Contact Info", icon: Phone, exact: false },
  { to: "/admin/footer", label: "Footer", icon: PanelBottom, exact: false },
  { to: "/admin/settings", label: "Brand Settings", icon: Settings, exact: false },
  { to: "/admin/media", label: "Media Library", icon: Image, exact: false },
] as const;

function NavLink({
  to,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  onClick?: () => void;
}) {
  const state = useRouterState();
  const pathname = state.location.pathname;
  const isActive = exact ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      {isActive && <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-primary/60" />}
    </Link>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
  <AdminAuth>
    <div className="min-h-screen bg-muted/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background border-r border-border transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="text-sm font-semibold tracking-[0.16em] text-foreground uppercase">
            RAHIQ Admin
          </span>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Website</span>
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-semibold tracking-[0.14em] uppercase text-foreground">
            RAHIQ Admin
          </span>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Shared admin UI primitives ───────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-normal text-foreground transition-colors focus:border-primary focus:outline-none placeholder:text-muted-foreground/60";

const labelClass = "mb-1.5 block text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase";

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-background p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AdminField({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(inputClass, "min-h-[5rem] resize-y", props.className)} />
  );
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(inputClass, "cursor-pointer appearance-none", props.className)}
    />
  );
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-normal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "ghost" && "border border-border text-muted-foreground hover:text-foreground hover:bg-muted",
        variant === "danger" && "border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-muted text-muted-foreground",
        variant === "success" && "bg-green-100 text-green-700",
        variant === "warning" && "bg-amber-100 text-amber-700",
        variant === "danger" && "bg-red-100 text-red-600",
      )}
    >
      {children}
    </span>
  );
}

export function AdminSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-foreground mb-4">{children}</h2>
  );
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  variant = "danger",
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-background border border-border p-6 shadow-xl">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-5 flex gap-3 justify-end">
          <AdminButton variant="ghost" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function SaveBar({
  saving,
  saved,
  onSave,
  dirty,
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  dirty: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <AdminButton onClick={onSave} disabled={saving || !dirty}>
        {saving ? "Saving..." : "Save Changes"}
      </AdminButton>
      {saved && (
        <span className="text-xs text-green-600 font-medium">Saved successfully</span>
      )}
    </div>
  </AdminAuth>
);
}
