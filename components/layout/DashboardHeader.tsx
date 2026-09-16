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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-white/10 bg-[#0b0f19]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#171c2b] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 hover:text-slate-100"
        >
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-slate-100">{title}</span>
        <span className="hidden md:inline text-[11px] text-slate-500 truncate">
          · Phaeron Internal Management System
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#171c2b] px-2.5 py-1.5 text-[11px] font-semibold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d084] live-pulse" />
          Live · Managing fleet
        </span>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#171c2b] text-slate-400 hover:text-[#818cf8]"
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
                  ? "bg-[#818cf8] text-[#0b0f19]"
                  : "bg-[#171c2b] text-slate-400 border border-white/10"
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
