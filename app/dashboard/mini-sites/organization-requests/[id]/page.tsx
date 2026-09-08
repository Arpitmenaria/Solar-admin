"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Calendar, CheckCircle2, AlertCircle, Link as LinkIcon, Copy, Trash2, XCircle, X } from "lucide-react";
import { useOrganizationDetail, useApproveOrganization, useRejectOrganization, useDeleteOrganization } from "@/hooks/use-organizations";
import { UserAvatar } from "@/components/shared/user-avatar";
import { cn, formatDate, formatNumberFull } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";

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

function DescriptionModal({
  open,
  description,
  onClose,
}: {
  open: boolean;
  description: string;
  onClose: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.10] bg-[#0d1321] p-6 shadow-2xl shadow-black/60 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Full Description</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/[0.05] rounded transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <p className="text-[14px] text-slate-200 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function RejectModal({
  open,
  orgName,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  orgName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!open) {
      setReason("");
    }
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.10] bg-[#0d1321] p-6 shadow-2xl shadow-black/60"
          >
            <h3 className="text-base font-semibold text-white">Reject Organization?</h3>
            <p className="mt-1 text-sm text-slate-300">{orgName}</p>

            <div className="mt-4 space-y-3">
              <label className="text-[12px] font-semibold uppercase text-slate-400">
                Rejection Reason
              </label>
              <textarea
                ref={inputRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this organization is being rejected..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-red-500/40 focus:bg-white/[0.05] focus:outline-none resize-none"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] font-semibold text-slate-200 transition-colors hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) {
                    toast.error("Please provide a rejection reason");
                    return;
                  }
                  onConfirm(reason);
                }}
                disabled={isLoading || !reason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function DeleteModal({
  open,
  orgName,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  orgName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (!open) {
      setReason("");
    }
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.10] bg-[#0d1321] p-6 shadow-2xl shadow-black/60"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Delete Organization?</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              This will permanently delete <span className="font-semibold text-white">"{orgName}"</span>. This action cannot be undone.
            </p>

            <div className="space-y-3">
              <label className="text-[12px] font-semibold uppercase text-slate-400">
                Deletion Reason
              </label>
              <textarea
                ref={inputRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this organization is being deleted..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-red-500/40 focus:bg-white/[0.05] focus:outline-none resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] font-semibold text-slate-200 transition-colors hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reason.trim()) {
                    toast.error("Please provide a deletion reason");
                    return;
                  }
                  onConfirm(reason);
                }}
                disabled={isLoading || !reason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const [rejectModal, setRejectModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [descriptionModal, setDescriptionModal] = useState(false);

  const { data: detailData, isLoading } = useOrganizationDetail(orgId);
  const { mutate: approve, isPending: isApproving } = useApproveOrganization();
  const { mutate: reject, isPending: isRejecting } = useRejectOrganization();
  const { mutate: deleteOrg, isPending: isDeleting } = useDeleteOrganization();

  const handleApprove = () => {
    approve(orgId, {
      onSuccess: () => {
        toast.success("Organization approved successfully");
        router.push("/dashboard/mini-sites/organization-requests");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to approve organization");
      },
    });
  };

  const handleReject = (reason: string) => {
    reject(
      { organizationId: orgId, reason },
      {
        onSuccess: () => {
          toast.success("Organization rejected successfully");
          setRejectModal(false);
          router.push("/dashboard/mini-sites/organization-requests");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to reject organization");
        },
      }
    );
  };

  const handleDelete = (reason: string) => {
    deleteOrg(
      { organizationId: orgId, reason },
      {
        onSuccess: () => {
          toast.success("Organization deleted successfully");
          setDeleteModal(false);
          router.push("/dashboard/mini-sites/organization-requests");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to delete organization");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!detailData) {
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

  const org = detailData.organization;
  const author = detailData.author;
  const admin = detailData.admin;
  const members = detailData.members;
  const approvedBy = detailData.approvedBy;
  const rejectionReason = detailData.rejectionReason;

  const typeStyle = TYPE_STYLE[org.type] || TYPE_STYLE.business;
  const statusStyle = STATUS_STYLE[org.status] || STATUS_STYLE.pending;

  return (
    <div className="flex flex-col flex-1">
      <RejectModal
        open={rejectModal}
        orgName={org.name || ""}
        onClose={() => setRejectModal(false)}
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
      <DeleteModal
        open={deleteModal}
        orgName={org.name || ""}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <DescriptionModal
        open={descriptionModal}
        description={org.fullDescription || ""}
        onClose={() => setDescriptionModal(false)}
      />

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

            {/* Status Badge & Action Buttons */}
            <div className="flex items-center gap-3">
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

              {/* Action Buttons */}
              {org.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    disabled={isRejecting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              )}
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
                <p className="text-[13px] text-slate-200 leading-relaxed line-clamp-2">
                  {org.fullDescription || "—"}
                </p>
                {org.fullDescription && (
                  <button
                    onClick={() => setDescriptionModal(true)}
                    className="mt-2 text-[12px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    see more
                  </button>
                )}
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Members
                </h3>
                <p className="text-2xl font-bold text-white">{formatNumberFull(org.memberCount ?? 0)}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <h3 className="text-[12px] font-semibold uppercase text-slate-400 mb-2">
                  Mini Sites
                </h3>
                <p className="text-2xl font-bold text-white">{formatNumberFull(org.miniSitesCount ?? 0)}</p>
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
            {/* Organization Admin Info */}
            {admin ? (
              <div className="rounded-xl border border-white/[0.08] bg-card p-6">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={admin.avatar}
                    name={admin.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-white">{admin.name}</p>
                      {admin.role && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-300 capitalize">
                          🔴 {admin.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400">{admin.email}</p>
                    {admin.phone && (
                      <p className="text-[12px] text-slate-400 mt-1">{admin.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.08] bg-card p-6">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={author.avatar}
                    name={author.name}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-white">{author.name}</p>
                      {author.role && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 capitalize">
                          🔵 {author.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400">{author.email}</p>
                    {author.phone && (
                      <p className="text-[12px] text-slate-400 mt-1">{author.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </motion.div>

          {/* Right: Timeline & Delete */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
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
                      {approvedBy && (
                        <p className="text-[11px] text-emerald-200 mt-1">
                          by {approvedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {org.status === "rejected" && rejectionReason && (
                <div className="pt-4 border-t border-white/[0.05]">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-red-300">Rejected</p>
                      <p className="text-[12px] font-semibold text-white mt-1">{rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => setDeleteModal(true)}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900 px-4 py-3 text-[13px] font-semibold text-red-100 transition-colors hover:bg-red-950 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete Organization
            </button>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
