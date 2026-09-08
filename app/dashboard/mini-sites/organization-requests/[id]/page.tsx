"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Calendar, CheckCircle2, AlertCircle, Link as LinkIcon, Copy } from "lucide-react";
import { useOrganizationDetail } from "@/hooks/use-organizations";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn, formatDate, formatNumberFull } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  business: { bg: "bg-blue-500/10", text: "text-blue-300" },
  "non-profit": { bg: "bg-emerald-500/10", text: "text-emerald-300" },
  educational: { bg: "bg-purple-500/10", text: "text-purple-300" },
  community: { bg: "bg-orange-500/10", text: "text-orange-300" },
  club: { bg: "bg-pink-500/10", text: "text-pink-300" },
};

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string; bg: string }> = {
  pending: { dot: "bg-amber-400", text: "text-amber-300", label: "Pending", bg: "bg-amber-500/5" },
  approved: { dot: "bg-emerald-400", text: "text-emerald-300", label: "Approved", bg: "bg-emerald-500/5" },
  rejected: { dot: "bg-red-400", text: "text-red-300", label: "Rejected", bg: "bg-red-500/5" },
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const { data: org, isLoading } = useOrganizationDetail(orgId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-slate-400 mb-4">Organization not found</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={16} />
          Go back
        </button>
      </div>
    );
  }

  const typeStyle = TYPE_STYLE[org.type] || TYPE_STYLE.business;
  const statusStyle = STATUS_STYLE[org.status] || STATUS_STYLE.pending;

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{org.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Organization Details</p>
          </div>
        </motion.div>

        {/* Cover Image */}
        {org.coverImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-40 rounded-xl overflow-hidden border border-white/[0.08]"
          >
            <img
              src={org.coverImage}
              alt={org.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Main Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/[0.08] bg-card p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {org.logo && (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="w-20 h-20 rounded-lg border border-white/[0.10]"
                />
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-white">{org.name}</h2>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold capitalize",
                      typeStyle.bg,
                      typeStyle.text
                    )}
                  >
                    {org.type.replace("-", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{org.shortDescription}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={cn(
                "flex flex-col items-center rounded-lg px-4 py-3 border",
                statusStyle.bg,
                "border-white/[0.08]"
              )}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className={cn("h-2 w-2 rounded-full", statusStyle.dot)} />
                <span className={cn("text-xs font-semibold capitalize", statusStyle.text)}>
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Full Details Section */}
          <div className="space-y-4">
            {/* Short & Full Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Short Description
                </h3>
                <p className="text-[13px] text-slate-200 leading-relaxed">
                  {org.shortDescription || "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Full Description
                </h3>
                <p className="text-[13px] text-slate-200 leading-relaxed">
                  {org.fullDescription || "—"}
                </p>
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Slug
                </h3>
                <p className="text-[13px] font-mono text-slate-200">{org.slug}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Organization ID
                </h3>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-mono text-slate-300 truncate">{org.id}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(org.id);
                      toast.success("ID copied!");
                    }}
                    className="flex-shrink-0 p-1 hover:bg-white/[0.05] rounded transition-colors"
                  >
                    <Copy size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Organization Type
                </h3>
                <p className="text-[13px] capitalize text-slate-200">{org.type}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Creator & Members */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Creator Info */}
            <div className="rounded-xl border border-white/[0.08] bg-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Mail size={16} />
                Created By
              </h3>
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={org.createdBy.avatar}
                  name={org.createdBy.name}
                  size="md"
                />
                <div>
                  <p className="text-[13px] font-semibold text-white">{org.createdBy.name}</p>
                  <p className="text-[12px] text-slate-400">{org.createdBy.email}</p>
                  {org.createdBy.phone && (
                    <p className="text-[12px] text-slate-400 mt-1">{org.createdBy.phone}</p>
                  )}
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right: Status & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Members List */}
            {org.members && org.members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-card p-6"
              >
                <h3 className="text-sm font-semibold text-white mb-4">Members ({org.members.length})</h3>
                <div className="space-y-2">
                  {org.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                    >
                      <UserAvatar src={member.avatar} name={member.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white truncate">{member.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(member.id);
                          toast.success("Member ID copied!");
                        }}
                        className="p-1 hover:bg-white/[0.05] rounded transition-colors"
                      >
                        <Copy size={12} className="text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <div className="rounded-xl border border-white/[0.08] bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Created</p>
                  <p className="text-[12px] font-semibold text-white">{formatDate(org.createdAt)}</p>
                </div>
              </div>

              {org.status === "approved" && org.approvedAt && (
                <div className="pt-4 border-t border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-emerald-300">Approved</p>
                      <p className="text-[12px] font-semibold text-white">{formatDate(org.approvedAt)}</p>
                      {org.approvedBy && (
                        <p className="text-[11px] text-emerald-200 mt-1">
                          by {org.approvedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {org.status === "rejected" && org.rejectionReason && (
                <div className="pt-4 border-t border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-red-300">Rejected</p>
                      <p className="text-[12px] font-semibold text-white mt-1">{org.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-[11px] text-slate-400">Members</p>
                <p className="text-2xl font-bold text-white mt-2">{formatNumberFull(org.memberCount ?? 0)}</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
                <p className="text-[11px] text-slate-400">Mini Sites</p>
                <p className="text-2xl font-bold text-white mt-2">{formatNumberFull(org.miniSitesCount ?? 0)}</p>
              </div>
            </div>

            {/* Rejection Reason */}
            {org.status === "rejected" && org.rejectionReason && (
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h3 className="text-[12px] font-semibold text-red-300 mb-2">Rejection Reason</h3>
                <p className="text-[12px] text-red-200">{org.rejectionReason}</p>
              </div>
            )}

            {/* Organization Admin */}
            {org.organizationAdmin && (
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h3 className="text-[12px] font-semibold text-blue-300 mb-2">Organization Admin</h3>
                <p className="text-[12px] font-semibold text-blue-100">{org.organizationAdmin.name}</p>
                <p className="text-[11px] text-blue-200">{org.organizationAdmin.email}</p>
              </div>
            )}

          </motion.div>
        </div>
      </main>
    </div>
  );
}
