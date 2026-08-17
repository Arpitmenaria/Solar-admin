"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { TbPencil, TbBan, TbCircleCheck, TbTrash } from "react-icons/tb";
import { Search, ShieldCheck } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { ExpandableText } from "@/components/shared/expandable-text";
import { useGroup, useGroupMembers } from "@/hooks/use-groups";
import { formatDate, formatNumberFull, cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/components/groups/group-meta";
import { GroupActionDialog, type PendingGroupAction } from "@/components/groups/group-action-dialog";
import type { GroupMember } from "@/constants/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const ROLE_BADGE: Record<GroupMember["role"], string> = {
  Admin: "border-blue-500/30 text-blue-300 bg-blue-500/10",
  Moderator: "border-purple-500/30 text-purple-300 bg-purple-500/10",
  Member: "border-white/[0.12] text-slate-300 bg-white/[0.03]",
};

const TABS = [
  { value: "about", label: "About" },
  { value: "members", label: "Members" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: group, isLoading } = useGroup(id);
  const { data: members, isLoading: membersLoading } = useGroupMembers(id);
  const [pendingAction, setPendingAction] = useState<PendingGroupAction | null>(null);
  const [tab, setTab] = useState<TabValue>("about");
  const [memberSearch, setMemberSearch] = useState("");

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members ?? [];
    return (members ?? []).filter((m) => m.name.toLowerCase().includes(q));
  }, [members, memberSearch]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Group not found</div>
      </div>
    );
  }

  const st = STATUS_STYLES[group.status];

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/groups" />
        </motion.div>

        {/* Cover image + overlapping avatar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative">
          <div className="relative h-32 overflow-hidden rounded-xl border border-white/[0.08] sm:h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={group.coverUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 left-6 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-[#080c16] sm:h-24 sm:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={group.avatarUrl} alt="" className="h-full w-full object-cover" />
          </div>
        </motion.div>

        {/* Title row + manage actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 pl-0 pt-8 sm:flex-row sm:items-start sm:justify-between sm:pl-[136px] sm:pt-0"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                <span className={st.text}>{st.label}</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatNumberFull(group.members)} members &middot; Created {formatDate(group.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/groups/${group.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <TbPencil size={14} /> Edit Group
            </Link>

            {group.status === "SUSPENDED" ? (
              <button
                onClick={() => setPendingAction({ action: "UNSUSPEND", groupId: group.id, groupName: group.name })}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                <TbCircleCheck size={14} /> Unsuspend
              </button>
            ) : (
              <button
                onClick={() => setPendingAction({ action: "SUSPEND", groupId: group.id, groupName: group.name })}
                className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3.5 py-2 text-[12px] font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                <TbBan size={14} /> Suspend
              </button>
            )}

            <button
              onClick={() => setPendingAction({ action: "DELETE", groupId: group.id, groupName: group.name })}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <TbTrash size={14} /> Delete Group
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative border-b border-white/[0.08]">
          <div className="flex gap-6">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "relative pb-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                    active ? "text-blue-400" : "text-caption hover:text-white"
                  )}
                >
                  {t.label}
                  {active && <span className="absolute -bottom-px left-0 h-[2px] w-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {tab === "about" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">About this Group</h2>
            </div>
            {group.description ? (
              <ExpandableText
                text={group.description}
                lines={3}
                className="text-sm leading-relaxed text-slate-300"
              />
            ) : (
              <p className="text-sm leading-relaxed text-slate-300">
                No description has been provided for this group yet.
              </p>
            )}
          </motion.div>
        )}

        {tab === "members" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321]">
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
              <div className="relative w-full max-w-[280px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4d6a]" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  aria-label="Search members"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-[12px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
                />
              </div>
              <span className="ml-auto text-[11px] text-caption">
                {membersLoading ? "Loading…" : `${filteredMembers.length} shown`}
              </span>
            </div>

            <div>
              {membersLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-12 text-center text-sm text-caption">No members match your search.</div>
              ) : (
                filteredMembers.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3 last:border-b-0"
                  >
                    <UserAvatar name={member.name} src={member.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{member.name}</p>
                      <p className="text-[11px] text-caption">Joined {formatDate(member.joinedAt)}</p>
                    </div>
                    <span className={cn("inline-flex w-fit items-center rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide", ROLE_BADGE[member.role])}>
                      {member.role}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </main>

      <GroupActionDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onSuccess={(action) => { if (action === "DELETE") router.push("/dashboard/groups"); }}
      />
    </div>
  );
}
