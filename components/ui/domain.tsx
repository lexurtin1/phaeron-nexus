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
  tone?: "navy" | "purple" | "healthy" | "warning" | "critical" | "muted";
  className?: string;
}) {
  const tones = {
    navy: "bg-[var(--color-navy-glow)] text-primary",
    purple: "bg-[var(--color-purple-glow)] text-[var(--color-purple-primary)]",
    healthy: "bg-[var(--color-healthy-glow)] text-[var(--color-healthy)]",
    warning: "bg-[var(--color-warning-glow)] text-[var(--color-warning)]",
    critical: "bg-[var(--color-critical-glow)] text-[var(--color-critical)]",
    muted: "bg-muted text-muted-foreground",
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
        "inline-flex rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("h-px w-full bg-border", className)} role="separator" />
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
