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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globalKpis, incidents } from "@/data/mock";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/ontology", label: "GraphRAG", icon: Network },
  { href: "/infrastructure", label: "Infrastructure", icon: Server },
  { href: "/revenue", label: "Revenue", icon: PoundSterling },
  { href: "/team", label: "Team", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
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

  return (
    <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col border-r border-[#e2e8f0] bg-white/95 backdrop-blur-md">
      <div className="flex items-start gap-3 p-6 border-b border-[#e2e8f0]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/phaeron-logo.png"
          alt="Phaeron"
          className="h-11 w-11 rounded-xl object-contain bg-[#f4f6f9] p-1"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl leading-tight text-[#0a1628]">
              NEXUS
            </h1>
            <span className="relative inline-flex h-2.5 w-2.5" title="Fleet status">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping",
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
          <p className="text-[11px] text-[#64748b] leading-snug mt-0.5">
            Internal Management System
          </p>
          <p className="text-[10px] text-[#94a3b8] leading-snug">
            Clients · Fleet · Revenue · GraphRAG
          </p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#0a1628] text-white shadow-sm"
                  : "text-[#64748b] hover:bg-[#f4f6f9] hover:text-[#0a1628]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e2e8f0] space-y-2">
        <div className="flex items-center gap-2 rounded-xl bg-[#f4f6f9] px-3 py-2.5">
          <Activity className="h-4 w-4 text-[#e11d48]" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              Fleet integrity
            </p>
            <p className="text-sm font-semibold text-[#0a1628] tabular-nums">
              {kpis.fleetUptime.toFixed(2)}% · {kpis.openIncidents} incidents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot.png"
            alt=""
            className="h-8 w-8 rounded-full border border-[#e2e8f0] object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0a1628] truncate">
              Alex Curtin
            </p>
            <p className="text-[11px] text-[#64748b]">Commercial · EMEA</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
