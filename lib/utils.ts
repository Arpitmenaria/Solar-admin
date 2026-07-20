import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

/** Full comma-separated number — no abbreviation (used on Users page to match Figma) */
export function formatNumberFull(n: number): string {
  return n.toLocaleString();
}

export function formatCurrency(n: number): string {
  return "$" + n.toLocaleString();
}

/** Shown wherever the backend has no value for a field. */
export const NA = "NA";

/** Falls back to NA for null, undefined, or blank strings. */
export function na(value: string | null | undefined): string {
  return value && value.trim() ? value : NA;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return NA;
  const date = new Date(dateStr);
  // An unparseable date would otherwise render the string "Invalid Date".
  if (Number.isNaN(date.getTime())) return NA;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getInitials(name: string): string {
  const words = name.replace(/^@/, "").trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
