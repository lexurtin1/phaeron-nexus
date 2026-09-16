import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-navy-primary)] text-white hover:bg-[var(--color-navy-mid)]",
  secondary:
    "bg-white text-[var(--color-navy-primary)] border border-[rgba(10,22,40,0.12)] hover:border-[var(--color-navy-mid)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-white/60 hover:text-[var(--color-navy-primary)]",
  danger:
    "bg-[var(--color-crimson-primary)] text-white hover:bg-[var(--color-crimson-deep)]",
  subtle:
    "bg-[var(--color-navy-glow)] text-[var(--color-navy-mid)] hover:bg-[rgba(30,77,160,0.22)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px] tracking-[0.04em]",
  md: "h-9 px-4 text-[12px] tracking-[0.03em]",
};

export function Button({
  variant = "secondary",
  size = "sm",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold uppercase transition-colors disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
