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
  primary: "bg-[#818cf8] text-[#0b0f19] hover:bg-[#a5b4fc]",
  secondary:
    "bg-[#171c2b] text-slate-100 border border-white/10 hover:border-[#818cf8]",
  ghost:
    "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100",
  danger: "bg-[#ef4444] text-white hover:bg-[#be123c]",
  subtle: "bg-[rgba(123,97,255,0.18)] text-[#a78bfa] hover:bg-[rgba(123,97,255,0.28)]",
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
