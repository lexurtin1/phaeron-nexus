import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function Card({
  children,
  elevated,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        elevated ? "glass-elevated" : "glass-panel",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
