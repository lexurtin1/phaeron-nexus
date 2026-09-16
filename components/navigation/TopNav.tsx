"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Global" },
  { href: "/clients", label: "Clients" },
  { href: "/ontology", label: "Ontology" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/revenue", label: "Revenue" },
  { href: "/team", label: "Team" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center gap-6 border-b border-[rgba(10,22,40,0.06)] bg-[rgba(255,255,255,0.82)] px-6 backdrop-blur-[14px] md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <Link href="/" className="inline-flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/phaeron-wordmark.png"
            alt="Phaeron"
            className="h-10 w-auto mix-blend-multiply md:h-12"
          />
          <span
            className="hidden h-[22px] w-px bg-[rgba(10,22,40,0.12)] sm:block"
            aria-hidden
          />
          <span className="hidden text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-navy-mid)] sm:inline">
            Nexus
          </span>
        </Link>
      </div>

      <nav className="flex max-w-[50vw] items-center gap-0.5 overflow-x-auto lg:max-w-none lg:gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors md:px-3 md:text-[12px]",
                active
                  ? "text-[var(--color-navy-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-navy-mid)]"
              )}
            >
              {item.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-[var(--color-navy-accent)] md:inset-x-3" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[13px] font-semibold text-[var(--color-navy-deep)]">
            Alex Curtin
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Commercial · EMEA
          </p>
        </div>
        <div className="h-9 w-9 overflow-hidden rounded-full border border-[rgba(10,22,40,0.1)] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/headshot.png"
            alt="Alex Curtin"
            className="h-full w-full object-cover"
          />
        </div>
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(10,22,40,0.1)] bg-white text-[var(--color-navy-mid)] hover:border-[var(--color-navy-mid)]"
          aria-label="Home"
          title="Command home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
