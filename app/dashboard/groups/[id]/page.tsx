"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { TbWorld, TbLock, TbPencil, TbBan, TbCircleCheck, TbTrash } from "react-icons/tb";

import { Header } from "@/components/layouts/header";
import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useGroup } from "@/hooks/use-groups";
import { formatDate, formatNumberFull } from "@/lib/utils";
import { CATEGORY_ICON, CAT_BADGE, STATUS_STYLES } from "@/components/groups/group-meta";
import { GroupActionDialog, type PendingGroupAction } from "@/components/groups/group-action-dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: group, isLoading } = useGroup(id);
  const [pendingAction, setPendingAction] = useState<PendingGroupAction | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-1 flex-col">
        <Header title="Group Detail" breadcrumbs={[{ label: "Groups", href: "/dashboard/groups" }, { label: "Group Detail" }]} />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Group not found</div>
      </div>
    );
  }

  const CatIcon = CATEGORY_ICON[group.category];
  const st = STATUS_STYLES[group.status];

  return (
    <div className="flex flex-1 flex-col">
      <Header title="Group Detail" breadcrumbs={[{ label: "Groups", href: "/dashboard/groups" }, { label: "Group Detail" }]} />

      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/groups" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              <span className={st.text}>{st.label}</span>
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Created {formatDate(group.createdAt)}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
              <p className="text-label mb-3">CATEGORY</p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: group.iconColor + "33", border: `1px solid ${group.iconColor}55` }}>
                  <CatIcon size={20} className="text-white" />
                </div>
                <span className={`inline-flex w-fit items-center rounded border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${CAT_BADGE[group.category]}`}>
                  {group.category}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                {group.privacy === "Public" ? <TbWorld size={14} className="text-caption" /> : <TbLock size={14} className="text-caption" />}
                {group.privacy}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
              <p className="text-label mb-3">OWNER</p>
              <div className="flex items-center gap-3">
                <UserAvatar name={group.owner.name} src={group.owner.avatarUrl} size="md" />
                <p className="text-sm font-semibold text-white">{group.owner.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
                <p className="text-label mb-2">MEMBERS</p>
                <p className="text-2xl font-bold text-[#99CBFF]">{formatNumberFull(group.members)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
                <p className="text-label mb-2">POSTS</p>
                <p className="text-2xl font-bold text-[#99CBFF]">{formatNumberFull(group.posts)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-5">
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Manage Group</h2>
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
            </div>
          </motion.div>
        </motion.div>
      </main>

      <GroupActionDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onSuccess={(action) => { if (action === "DELETE") router.push("/dashboard/groups"); }}
      />
    </div>
  );
}
