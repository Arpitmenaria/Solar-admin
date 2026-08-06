"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, CreditCard, Calendar, ArrowUpRight, Ban, RotateCcw } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionReasonDialog } from "@/components/shared/action-reason-dialog";
import { useUser, useToggleSuspend } from "@/hooks/use-users";
import { useUserAuditLogs } from "@/hooks/use-audit-logs";
import { auditActionLabel } from "@/services/audit-logs.service";
import { RelationsModal } from "@/components/users/relations-modal";
import { ReportedByModal } from "@/components/users/reported-by-modal";
import { formatNumberFull, formatDate, na, cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { SYSTEM_VERSION } from "@/constants/nav";
import type { RelationKind } from "@/types";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

/* Tier chip styling — keyed by the lowercased plan name, with a neutral
   fallback for anything unexpected. */
const TIER_CHIP: Record<string, string> = {
  gold:     "bg-gradient-to-r from-amber-500/25 to-yellow-500/10 text-amber-300 border-amber-500/40",
  platinum: "bg-gradient-to-r from-slate-200/20 to-cyan-400/10 text-cyan-200 border-cyan-400/30",
  free:     "bg-white/[0.05] text-slate-300 border-white/[0.14]",
};
const tierChipClass = (plan: string) =>
  TIER_CHIP[plan.trim().toLowerCase()] ?? "bg-blue-500/15 text-blue-300 border-blue-500/30";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const toggleSuspend = useToggleSuspend();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [relationKind, setRelationKind] = useState<RelationKind | null>(null);
  const [reportedByOpen, setReportedByOpen] = useState(false);
  const { data: auditData } = useUserAuditLogs(id, 1, 10, !!id);

  const suspended = !!user?.isSuspended;

  const confirmToggle = ({ reason, notes }: { reason: string; notes: string }) => {
    if (!user) return;
    const name = na(user.displayName);
    toggleSuspend.mutate({ id: user.id, reason, notes }, {
      onSuccess: (nowSuspended) =>
        toast.success(
          nowSuspended ? `"${name}" suspended and notified by email.` : `"${name}" has been reactivated.`
        ),
      onError: () =>
        toast.error(
          suspended
            ? "Couldn't reactivate this account. Please try again."
            : "Couldn't suspend this account. Please try again."
        ),
    });
    setConfirmOpen(false);
  };

  if (isLoading) return <UserDetailSkeleton />;
  if (!user) return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">User not found</div>
  );

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 p-4 md:p-6 space-y-5">
        {/* Back button above title */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton />
          <h1 className="mt-3 text-2xl font-bold text-white">{na(user.displayName)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View user profile, location, and moderation history.
          </p>
        </motion.div>

        {/* Top row: profile card + stat cards */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
        >
          {/* Profile card */}
          <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6 flex flex-col gap-5">
            {/* Profile fields are read-only — suspension is the only action
                admins can take on a user from here. */}
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full p-[3px] bg-gradient-to-br from-blue-500/60 via-blue-400/30 to-transparent">
                <UserAvatar src={user.avatarUrl} name={user.displayName} size="xl" />
              </div>

              {/* Account state, right under the avatar so it reads before the action. */}
              <StatusBadge status={suspended ? "INACTIVE" : "ACTIVE"} />

              {/* Outline/ghost styling so the destructive action reads as a
                  deliberate choice, not a primary CTA. */}
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={toggleSuspend.isPending}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  suspended
                    ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/60"
                    : "border-red-500/40 text-red-300 hover:bg-red-500/10 hover:border-red-500/60"
                )}
              >
                {suspended
                  ? <><RotateCcw size={12} /> Reactivate Account</>
                  : <><Ban size={12} /> Suspend Account</>}
              </button>
            </div>

            {/* Fields — username is omitted; the backend has no separate handle,
                so it just duplicates the display name. */}
            <div className="space-y-4">
              <ProfileField label="DISPLAY NAME" value={user.displayName} />
              <ProfileField label="BIO" value={user.bio} expandable />
              <ProfileField label="LOCATION" value={user.location} />
              <ProfileField label="PROFESSION" value={user.profession} />
            </div>
          </motion.div>

          {/* Right column: stats + groups/events + account/subscription */}
          <div className="space-y-5">
            {/* Stat cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Clickable only when there's at least one to show. */}
              <MiniStat
                label="CONNECTIONS"
                value={formatNumberFull(user.stats.friends)}
                onClick={user.stats.friends > 0 ? () => setRelationKind("connections") : undefined}
              />
              <MiniStat
                label="FOLLOWERS"
                value={formatNumberFull(user.stats.followers)}
                onClick={user.stats.followers > 0 ? () => setRelationKind("followers") : undefined}
              />
              <MiniStat
                label="FOLLOWING"
                value={formatNumberFull(user.stats.following)}
                onClick={user.stats.following > 0 ? () => setRelationKind("following") : undefined}
              />
              <MiniStat
                label="REPORTED POSTS"
                value={formatNumberFull(user.stats.reportedPosts)}
                href={`/dashboard/post-reports?authorId=${user.id}`}
              />
              <MiniStat
                label="REPORTED BY"
                value={formatNumberFull(user.stats.reportedByCount)}
                onClick={user.stats.reportedByCount > 0 ? () => setReportedByOpen(true) : undefined}
              />
              <MiniStat label="CREATED POSTS"  value={formatNumberFull(user.stats.createdPosts)} />
            </motion.div>

            {/* Groups + Events */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-[#3b82f6]" />
                    <span className="text-sm font-semibold text-white">Groups</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.groups.total} Total</span>
                </div>
                <div className="border-t border-white/[0.05] pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-semibold text-white">{user.groups.created}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-semibold text-white">{user.groups.joined}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#3b82f6]" />
                    <span className="text-sm font-semibold text-white">Events</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.events.total} Total</span>
                </div>
                <div className="border-t border-white/[0.05] pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-semibold text-white">{user.events.created}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-semibold text-white">{user.events.joined}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subscription. (The former Account Status card was dropped — the
                state badge sits under the avatar and the tier is the plan below.) */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4">
              {/* Subscription — absent for users who never subscribed, and
                  validity/payment stay null until billing is wired up. */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-label">SUBSCRIPTION PLAN</p>
                  {user.subscription && (
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                      user.subscription.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.subscription.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"}`} />
                      {user.subscription.status}
                    </span>
                  )}
                </div>

                {user.subscription ? (
                  <>
                    <span className={cn(
                      "inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.1em]",
                      tierChipClass(user.subscription.plan)
                    )}>
                      {na(user.subscription.plan).toUpperCase()}
                    </span>
                    {/* Validity/payment are null for manually-granted tiers.
                        Show the grid only when there's real data; otherwise just
                        the plan + status above stand on their own. */}
                    {(user.subscription.validUntil || user.subscription.paymentMethod) && (
                      <div className="border-t border-white/[0.05] pt-3 grid grid-cols-2 gap-2">
                        {user.subscription.validUntil && (
                          <div>
                            <p className="text-label">VALIDITY</p>
                            <p className="text-xs text-slate-200 mt-1">
                              Expires {formatDate(user.subscription.validUntil)}
                            </p>
                          </div>
                        )}
                        {user.subscription.paymentMethod && (
                          <div>
                            <p className="text-label">PAYMENT</p>
                            <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
                              <CreditCard size={11} className="text-muted-foreground shrink-0" />
                              <span className="truncate">{user.subscription.paymentMethod}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No active subscription.</p>
                )}
              </div>
            </motion.div>

            {/* Admin actions taken on this user (audit trail). */}
            {auditData && auditData.data.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Admin Actions on This User</h4>
                  <Link
                    href={`/dashboard/audit-logs?targetId=${user.id}`}
                    className="text-[11px] font-semibold text-[#99CBFF] transition-colors hover:text-white"
                  >
                    See all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {auditData.data.map((log) => (
                    <div key={log.id} className="border-l-2 border-white/[0.08] pl-3">
                      <div className="flex flex-wrap items-center gap-x-2 text-[12px]">
                        <span className="font-semibold text-white">{auditActionLabel(log.action)}</span>
                        <span className="text-caption">·</span>
                        <span className="text-slate-300">{na(log.adminName)}</span>
                        <span className="text-caption">·</span>
                        <span className="text-caption">{formatDate(log.createdAt)}</span>
                      </div>
                      {log.reason && <p className="mt-0.5 text-[11px] text-caption">Reason: {log.reason}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <RelationsModal
        userId={user.id}
        kind={relationKind}
        open={!!relationKind}
        onClose={() => setRelationKind(null)}
      />

      <ReportedByModal
        userId={user.id}
        userName={user.displayName}
        open={reportedByOpen}
        onClose={() => setReportedByOpen(false)}
      />

      <ActionReasonDialog
        open={confirmOpen}
        title={suspended ? "Reactivate this account?" : "Suspend this account?"}
        description={suspended
          ? `Restores "${na(user.displayName)}"'s access to the platform.`
          : `Blocks "${na(user.displayName)}" from the platform, signs them out, and notifies them by email.`}
        confirmLabel={suspended ? "Reactivate Account" : "Suspend Account"}
        variant={suspended ? "default" : "destructive"}
        pending={toggleSuspend.isPending}
        onConfirm={confirmToggle}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Status bar */}
      {/* <footer className="flex items-center justify-between border-t border-white/[0.06] px-6 py-2.5 text-[10px] text-[#3a4a6a]">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span>UID: {user.id.toUpperCase()} &nbsp;&nbsp; {SYSTEM_VERSION}</span>
      </footer> */}
    </div>
  );
}

function ProfileField({ label, value, expandable }: { label: string; value?: string | null; expandable?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const missing = !value || !value.trim();

  // Show the toggle only when the text genuinely exceeds three lines. Measured
  // against the clamped element, so it's driven by real layout — not a
  // character-count guess that ignores wrapping and line breaks. `expanded` is
  // deliberately excluded: re-measuring once the clamp is lifted would read no
  // overflow and hide the "Show less" button.
  useEffect(() => {
    const el = textRef.current;
    if (!expandable || missing || !el) { setOverflows(false); return; }
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [expandable, missing, value]);

  return (
    <div>
      <p className="text-label mb-1">{label}</p>
      <p
        ref={textRef}
        className={cn(
          "text-sm break-words",
          missing ? "italic text-muted-foreground" : "text-slate-200",
          expandable && !expanded && "line-clamp-3"
        )}
      >
        {na(value)}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value, href, onClick }: {
  label: string; value: string; href?: string; onClick?: () => void;
}) {
  const interactive = !!href || !!onClick;
  const card = (
    <div className={cn(
      "rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 text-left",
      interactive && "transition-colors hover:border-blue-500/40 hover:bg-blue-500/[0.04]"
    )}>
      <p className="text-label mb-2 flex items-center gap-1">
        {label}
        {interactive && <ArrowUpRight size={11} className="text-caption" />}
      </p>
      <p className="text-2xl font-bold text-[#99CBFF]">{value}</p>
    </div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="w-full">{card}</button>;
  return card;
}

function UserDetailSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-5">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-[340px_1fr] gap-5">
        <Skeleton className="h-80 rounded-xl" />
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
