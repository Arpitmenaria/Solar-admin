import type { UserStatus } from "@/types";

export const USER_FILTER_TABS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "ALL USERS", value: "ALL" },
  { label: "ACTIVE",    value: "ACTIVE" },
  // Label and value diverge on purpose: the API filters on INACTIVE, which
  // means suspended. Don't "fix" the label back — see status-badge.tsx.
  { label: "SUSPENDED", value: "INACTIVE" },
  { label: "PREMIUM",   value: "PREMIUM" },
];
