"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Network,
  Server,
  PoundSterling,
  Users,
  Activity,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globalKpis, incidents } from "@/data/mock";
import { ThemeToggle } from "@/components/common/theme-toggle";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/ontology", label: "GraphRAG", icon: Network },
  { href: "/infrastructure", label: "Infrastructure", icon: Server },
  { href: "/revenue", label: "Revenue", icon: PoundSterling },
  { href: "/team", label: "Team", icon: Users },
];

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/clients": "Clients",
  "/ontology": "GraphRAG",
  "/infrastructure": "Infrastructure",
  "/revenue": "Revenue",
  "/team": "Team",
};

function useFleetStatus() {
  const kpis = globalKpis();
  const critical = incidents.some(
    (i) => i.severity === "critical" && i.status !== "resolved"
  );
  const backendStatus = critical
    ? "unhealthy"
    : kpis.openIncidents > 0
      ? "degraded"
      : "healthy";
  const statusClass =
    backendStatus === "healthy"
      ? "bg-emerald-500"
      : backendStatus === "unhealthy"
        ? "bg-rose-500"
        : "bg-amber-500";
  return { kpis, backendStatus, statusClass };
}

export function Sidebar() {
  const pathname = usePathname();
  const { kpis, statusClass } = useFleetStatus();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="border-b border-sidebar-border px-5 pb-4 pt-5">
        <div className="rounded-lg bg-white px-2 py-2 dark:bg-white/95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/phaeron-nexus.png"
            alt="Phaeron NEXUS"
            className="block h-auto w-full max-h-[56px] object-contain object-left"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-lg font-bold leading-none">NEXUS</h1>
          <span
            className="relative inline-flex h-2.5 w-2.5"
            title="Fleet status"
          >
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", // unslop-ignore: status ping
                statusClass
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                statusClass
              )}
            />
          </span>
        </div>
        <p className="mt-1 text-[12px] font-medium leading-snug text-muted-foreground">
          Internal Management System
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-semibold transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2.5">
          <Activity className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Fleet integrity
            </p>
            <p className="tabular-nums text-sm font-semibold">
              {kpis.fleetUptime.toFixed(2)}% · {kpis.openIncidents} incidents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot.png"
            alt=""
            className="h-8 w-8 rounded-full border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Alex Curtin</p>
            <p className="text-[11px] text-muted-foreground">
              Commercial · EMEA
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function DashboardHeader() {
  const pathname = usePathname();
  const base = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)));
  const title = TITLES[base ?? "/"] ?? "NEXUS";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="rounded-md bg-white px-1.5 py-1 dark:bg-white/95">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/phaeron-nexus.png"
              alt="Phaeron"
              className="h-6 w-auto object-contain"
            />
          </div>
        </div>
        <span className="font-semibold text-foreground">{title}</span>
        <span className="hidden truncate text-[11px] text-muted-foreground md:inline">
          · Phaeron Internal Management System
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
          <span className="live-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live · Managing fleet
        </span>
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="flex max-w-[45vw] gap-1 overflow-x-auto lg:hidden">
        {Object.entries(TITLES).map(([href, label]) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                active
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
