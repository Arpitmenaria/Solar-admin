"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pencil, Users, Eye, FileText, Flag, CreditCard, Calendar
} from "lucide-react";
import { Header } from "@/components/layouts/header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUser } from "@/hooks/use-users";
import { formatNumberFull, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { SYSTEM_VERSION } from "@/constants/nav";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);

  if (isLoading) return <UserDetailSkeleton />;
  if (!user) return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">User not found</div>
  );

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="User Detail"
        breadcrumbs={[
          { label: "User Management", href: "/dashboard/users" },
          { label: "User Detail" },
        ]}
       
      />

      <main className="flex-1 p-6 space-y-5">
        {/* Page heading */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage user profile, permissions, location, and moderation history.
          </p>
        </motion.div>

        {/* Top row: profile card + stat cards */}
        <motion.div
          className="grid grid-cols-[340px_1fr] gap-5"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
        >
          {/* Profile card */}
          <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6 flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <UserAvatar src={user.avatarUrl} name={user.displayName} size="xl" />
              <Link
                href={`/dashboard/users/${user.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                <Pencil size={12} />
                Edit Profile
              </Link>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <ProfileField label="USERNAME" value={user.username} />
              <ProfileField label="DISPLAY NAME" value={user.displayName} />
              <ProfileField label="BIO" value={user.bio || "—"} italic={!!user.bio} />
              <ProfileField label="LOCATION" value={user.location || "—"} />
              <ProfileField label="PROFESSION" value={user.profession || "—"} />
            </div>
          </motion.div>

          {/* Stats grid + groups/events */}
          <div className="space-y-5">
            {/* Stat cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
              <MiniStat label="FRIENDS"        value={formatNumberFull(user.stats.friends)} />
              <MiniStat label="FOLLOWERS"      value={formatNumberFull(user.stats.followers)} />
              <MiniStat label="FOLLOWING"      value={formatNumberFull(user.stats.following)} />
              <MiniStat label="REPORTED POSTS" value={formatNumberFull(user.stats.reportedPosts)} />
              <MiniStat label="CREATED POSTS"  value={formatNumberFull(user.stats.createdPosts)} />
              <MiniStat label="PROFILE VIEWS"  value={formatNumberFull(user.stats.profileViews)} />
            </motion.div>

            {/* Groups + Events */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
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
          </div>
        </motion.div>

        {/* Account status + subscription */}
        <motion.div
          className="grid grid-cols-2 gap-5"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          {/* Account status */}
          <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Account Status</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Current Tier: {user.accountTier}</p>
              </div>
              <StatusBadge status={user.status} />
            </div>
          </motion.div>

          {/* Subscription */}
          <motion.div variants={fadeUp} className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-label">SUBSCRIPTION PLAN</p>
              <span className={`flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                user.subscription.status === "ACTIVE"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user.subscription.status === "ACTIVE" ? "bg-blue-400" : "bg-red-400"}`} />
                {user.subscription.status}
              </span>
            </div>
            <p className="text-base font-bold text-[#3b82f6]">{user.subscription.plan}</p>
            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-4">
              <div>
                <p className="text-label">VALIDITY</p>
                <p className="text-sm text-slate-200 mt-1">Expires {user.subscription.validUntil}</p>
              </div>
              <div>
                <p className="text-label">PAYMENT METHOD</p>
                <p className="text-sm text-slate-200 mt-1 flex items-center gap-1.5">
                  <CreditCard size={12} className="text-muted-foreground" />
                  {user.subscription.paymentMethod}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Status bar */}
      <footer className="flex items-center justify-between border-t border-white/[0.06] px-6 py-2.5 text-[10px] text-[#3a4a6a]">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          System Secure: Latency 24ms
        </span>
        <span>UID: {user.id.toUpperCase()} &nbsp;&nbsp; {SYSTEM_VERSION}</span>
      </footer>
    </div>
  );
}

function ProfileField({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <p className="text-label mb-1">{label}</p>
      <p className={`text-sm text-slate-200 ${italic ? "italic" : ""}`}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4">
      <p className="text-label mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#99CBFF]">{value}</p>
    </div>
  );
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
