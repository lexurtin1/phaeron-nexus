"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/clients": "Clients",
  "/ontology": "GraphRAG",
  "/infrastructure": "Infrastructure",
  "/revenue": "Revenue",
  "/team": "Team",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const base = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)));
  const title = TITLES[base ?? "/"] ?? "NEXUS";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#e2e8f0] bg-[#f4f6f9]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b] hover:text-[#0a1628]"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <span className="text-[#94a3b8]">/</span>
        <span className="font-semibold text-[#0a1628]">{title}</span>
        <span className="hidden md:inline text-[11px] text-[#94a3b8] truncate">
          · Phaeron Internal Management System
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#64748b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669] live-pulse" />
          Live · Managing fleet
        </span>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0a1628]"
          title="Refresh"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="flex lg:hidden gap-1 overflow-x-auto max-w-[45vw]">
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
                  ? "bg-[#0a1628] text-white"
                  : "bg-white text-[#64748b] border border-[#e2e8f0]"
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
