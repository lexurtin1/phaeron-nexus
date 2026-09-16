import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/data/types";

export function HealthDot({
  status,
  className,
}: {
  status: HealthStatus;
  className?: string;
}) {
  return (
    <span
      className={cn("health-dot", className)}
      data-status={status}
      aria-label={status}
    />
  );
}

export function Badge({
  children,
  tone = "navy",
  className,
}: {
  children: React.ReactNode;
  tone?: "navy" | "healthy" | "warning" | "critical" | "muted";
  className?: string;
}) {
  const tones = {
    navy: "bg-[var(--color-navy-glow)] text-[var(--color-navy-mid)]",
    healthy: "bg-[var(--color-healthy-glow)] text-[var(--color-healthy)]",
    warning: "bg-[var(--color-warning-glow)] text-[var(--color-warning)]",
    critical: "bg-[var(--color-critical-glow)] text-[var(--color-critical)]",
    muted: "bg-[rgba(10,22,40,0.05)] text-[var(--color-text-muted)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-[rgba(10,22,40,0.08)] bg-white/70 px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full bg-[rgba(10,22,40,0.06)]", className)}
      role="separator"
    />
  );
}
