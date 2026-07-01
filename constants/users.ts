import type { UserStatus } from "@/types";

export const USER_FILTER_TABS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "ALL USERS", value: "ALL" },
  { label: "ACTIVE",    value: "ACTIVE" },
  { label: "INACTIVE",  value: "INACTIVE" },
  { label: "PREMIUM",   value: "PREMIUM" },
];
