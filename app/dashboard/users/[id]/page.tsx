"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, CreditCard, Calendar, ArrowUpRight, Ban, RotateCcw } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useUser, useToggleSuspend } from "@/hooks/use-users";
import { formatNumberFull, na, cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { SYSTEM_VERSION } from "@/constants/nav";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const toggleSuspend = useToggleSuspend();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const suspended = !!user?.isSuspended;

  const confirmToggle = () => {
    if (!user) return;
    const name = na(user.displayName);
    toggleSuspend.mutate(user.id, {
      onSuccess: (nowSuspended) =>
        toast.success(
          nowSuspended ? `"${name}" has been suspended.` : `"${name}" has been reactivated.`
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
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={toggleSuspend.isPending}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  suspended
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                )}
              >
                {suspended
                  ? <><RotateCcw size={12} /> Reactivate Account</>
                  : <><Ban size={12} /> Make Account Suspend</>}
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <ProfileField label="USERNAME" value={user.username} />
              <ProfileField label="DISPLAY NAME" value={user.displayName} />
              <ProfileField label="BIO" value={user.bio} expandable />
              <ProfileField label="LOCATION" value={user.location} />
              <ProfileField label="PROFESSION" value={user.profession} />
            </div>
          </motion.div>

          {/* Right column: stats + groups/events + account/subscription */}
          <div className="space-y-5">
            {/* 6 stat cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MiniStat label="CONNECTIONS"    value={formatNumberFull(user.stats.friends)} />
              <MiniStat label="FOLLOWERS"      value={formatNumberFull(user.stats.followers)} />
              <MiniStat label="FOLLOWING"      value={formatNumberFull(user.stats.following)} />
              <MiniStat
                label="REPORTED POSTS"
                value={formatNumberFull(user.stats.reportedPosts)}
                href="/dashboard/post-reports"
              />
              <MiniStat label="CREATED POSTS"  value={formatNumberFull(user.stats.createdPosts)} />
              <MiniStat label="PROFILE VIEWS"  value={formatNumberFull(user.stats.profileViews)} />
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

            {/* Account Status + Subscription — same row, same height */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account status */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Account Status</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">Current Tier: {user.accountTier}</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
              </div>

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
                    <p className="text-sm font-bold text-[#3b82f6]">{na(user.subscription.plan)}</p>
                    <div className="border-t border-white/[0.05] pt-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-label">VALIDITY</p>
                        <p className="text-xs text-slate-200 mt-1">
                          {user.subscription.validUntil ? `Expires ${user.subscription.validUntil}` : "NA"}
                        </p>
                      </div>
                      <div>
                        <p className="text-label">PAYMENT</p>
                        <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
                          <CreditCard size={11} className="text-muted-foreground shrink-0" />
                          <span className="truncate">{na(user.subscription.paymentMethod)}</span>
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No active subscription.</p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspended ? "Reactivate this account?" : "Suspend this account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspended
                ? `This restores "${na(user.displayName)}"'s access to the platform.`
                : `This blocks "${na(user.displayName)}" from the platform and signs them out of any active session. You can reactivate the account later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={suspended ? "default" : "destructive"}
              onClick={confirmToggle}
            >
              {suspended ? "Reactivate Account" : "Make Account Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
  const missing = !value || !value.trim();
  // Only bother with a toggle when the text is actually long enough to clamp.
  const clampable = expandable && !missing && value!.trim().length > 160;

  return (
    <div>
      <p className="text-label mb-1">{label}</p>
      <p
        className={cn(
          "text-sm break-words",
          missing ? "italic text-muted-foreground" : "text-slate-200",
          clampable && !expanded && "line-clamp-3"
        )}
      >
        {na(value)}
      </p>
      {clampable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value, href }: { label: string; value: string; href?: string }) {
  const card = (
    <div className={`rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 ${href ? "transition-colors hover:border-blue-500/40 hover:bg-blue-500/[0.04]" : ""}`}>
      <p className="text-label mb-2 flex items-center gap-1">
        {label}
        {href && <ArrowUpRight size={11} className="text-caption" />}
      </p>
      <p className="text-2xl font-bold text-[#99CBFF]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
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
