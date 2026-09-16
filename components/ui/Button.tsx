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
  primary: "bg-[#0a1628] text-white hover:bg-[#12233d]",
  secondary:
    "bg-white text-[#0a1628] border border-[#e2e8f0] hover:border-[#0a1628]",
  ghost:
    "bg-transparent text-[#64748b] hover:bg-[#f4f6f9] hover:text-[#0a1628]",
  danger: "bg-[#e11d48] text-white hover:bg-[#be123c]",
  subtle: "bg-[rgba(91,76,219,0.1)] text-[#5b4cdb] hover:bg-[rgba(91,76,219,0.16)]",
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
