"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-GB"),
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (n) => format(n));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
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
    <div
      className={cn(
        "mb-4 flex items-end justify-between gap-4",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[28px] leading-tight text-[var(--color-navy-deep)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-xl text-[13px] text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function KpiTile({
  label,
  value,
  suffix,
  format,
  hint,
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  format?: (n: number) => string;
  hint?: string;
  tone?: "default" | "critical" | "healthy";
}) {
  return (
    <div className="glass-panel p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-[28px] leading-none tracking-tight",
          tone === "critical" && "text-[var(--color-critical)]",
          tone === "healthy" && "text-[var(--color-healthy)]",
          !tone || tone === "default"
            ? "text-[var(--color-navy-deep)]"
            : undefined
        )}
      >
        <AnimatedNumber value={value} format={format} />
        {suffix && (
          <span className="ml-0.5 text-[16px] text-[var(--color-text-muted)]">
            {suffix}
          </span>
        )}
      </p>
      {hint && (
        <p className="mt-1.5 text-[11px] text-[var(--color-text-faint)]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-[rgba(10,22,40,0.1)] bg-white/80 px-3 text-[13px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-navy-accent)] focus:ring-2 focus:ring-[var(--color-navy-glow)]",
        className
      )}
      {...props}
    />
  );
}
