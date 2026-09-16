import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}m`;
    if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatLatency(ms: number): string {
  return `${Math.round(ms)}ms`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function greetingForDate(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export function formatCommandDate(date = new Date()): string {
  return date
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function healthLabel(status: string): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "warning":
      return "Degraded";
    case "critical":
      return "Critical";
    default:
      return status;
  }
}

export function maturityLabel(maturity: string): string {
  switch (maturity) {
    case "evaluation":
      return "Evaluation";
    case "deploying":
      return "Deploying";
    case "live":
      return "Live";
    case "ramped":
      return "Ramped";
    case "at_risk":
      return "At Risk";
    default:
      return maturity;
  }
}
