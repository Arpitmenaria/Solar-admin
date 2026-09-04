"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Mail, MapPin, CheckCircle2, XCircle, RotateCcw, AlertCircle,
  ChevronFirst, ChevronLast, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

import { StatCard } from "@/components/shared/stat-card";
import { CustomSelect } from "@/components/shared/custom-select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PaginationButton } from "@/components/shared/pagination-button";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { cn, formatNumberFull, formatDate } from "@/lib/utils";
import {
  useOrganizationStats,
  useOrganizations,
  useApproveOrganization,
  useRejectOrganization,
} from "@/hooks/use-organizations";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "business", label: "Business" },
  { value: "non-profit", label: "Non-Profit" },
  { value: "educational", label: "Educational" },
  { value: "community", label: "Community" },
];

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  business: { bg: "bg-blue-500/10", text: "text-blue-300" },
  "non-profit": { bg: "bg-emerald-500/10", text: "text-emerald-300" },
  educational: { bg: "bg-purple-500/10", text: "text-purple-300" },
  community: { bg: "bg-orange-500/10", text: "text-orange-300" },
};

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  pending: { dot: "bg-amber-400", text: "text-amber-300", label: "Pending" },
  approved: { dot: "bg-emerald-400", text: "text-emerald-300", label: "Approved" },
  rejected: { dot: "bg-red-400", text: "text-red-300", label: "Rejected" },
};

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
    }
  }, [open]);

  if (!open) return null;

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
            <p className="mt-1 text-sm text-caption">{orgName}</p>

            <div className="mt-4 space-y-3">
              <label className="text-[12px] font-semibold uppercase text-slate-400">
                Rejection Reason
              </label>
              <textarea
                ref={inputRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this organization is being rejected..."
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none resize-none"
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

export default function OrganizationRequestsPage() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; orgId: string; orgName: string }>({
    open: false,
    orgId: "",
    orgName: "",
  });

  const { data: stats, isLoading: statsLoading } = useOrganizationStats();
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations(page, 10, status);
  const { mutate: approve, isPending: isApproving } = useApproveOrganization();
  const { mutate: reject, isPending: isRejecting } = useRejectOrganization();

  const organizations = orgsData?.data ?? [];
  const totalPages = orgsData?.pagination?.totalPages ?? 1;

  const resetFilters = () => {
    setStatus("");
    setPage(1);
  };

  const handleApprove = (orgId: string) => {
    approve(orgId, {
      onSuccess: () => {
        toast.success("Organization approved successfully");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to approve organization");
      },
    });
  };

  const handleReject = (reason: string) => {
    reject(
      { organizationId: rejectModal.orgId, reason },
      {
        onSuccess: () => {
          toast.success("Organization rejected successfully");
          setRejectModal({ open: false, orgId: "", orgName: "" });
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to reject organization");
        },
      }
    );
  };

  return (
    <div className="flex flex-col flex-1">
      <RejectModal
        open={rejectModal.open}
        orgName={rejectModal.orgName}
        onClose={() => setRejectModal({ open: false, orgId: "", orgName: "" })}
        onConfirm={handleReject}
        isLoading={isRejecting}
      />

      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Organization Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review organization registration requests.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="TOTAL REQUESTS"
                value={formatNumberFull(stats?.totalOrganizations ?? 0)}
                icon={Building2}
              />
              <StatCard
                label="PENDING"
                value={formatNumberFull(stats?.pendingOrganizations ?? 0)}
                icon={Building2}
                sub="Awaiting review"
              />
              <StatCard
                label="APPROVED"
                value={formatNumberFull(stats?.approvedOrganizations ?? 0)}
                icon={CheckCircle2}
              />
              <StatCard
                label="REJECTED"
                value={formatNumberFull(stats?.rejectedOrganizations ?? 0)}
                icon={XCircle}
              />
            </>
          )}
        </div>

        {/* Requests Table */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-card">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <CustomSelect size="sm" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Headers */}
              <div className="grid gap-4 border-b border-white/[0.05] bg-white/[0.025] px-6 py-3 grid-cols-[minmax(200px,2fr)_1fr_minmax(180px,1.5fr)_minmax(140px,1.2fr)_120px]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Organization
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Type
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Email
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Status
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 text-center">
                  Actions
                </span>
              </div>

              {/* Rows */}
              {orgsLoading ? (
                <div className="px-6">{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
              ) : organizations.length === 0 ? (
                <div className="py-14 text-center text-sm text-caption">
                  No requests match the current filters.
                </div>
              ) : (
                organizations.map((org, i) => {
                  const typeStyle = TYPE_STYLE[org.type] || TYPE_STYLE.business;
                  const statusStyle = STATUS_STYLE[org.status] || STATUS_STYLE.pending;

                  return (
                    <motion.div
                      key={org.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid gap-4 border-b border-white/[0.04] px-6 py-4 items-center transition-colors hover:bg-white/[0.02] grid-cols-[minmax(200px,2fr)_1fr_minmax(180px,1.5fr)_minmax(140px,1.2fr)_120px]"
                    >
                      {/* Organization Name */}
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar src={org.logo} name={org.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-white">{org.name}</p>
                          <p className="truncate text-[11px] text-caption">
                            {formatDate(org.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Type */}
                      <span
                        className={cn(
                          "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                          typeStyle.bg,
                          typeStyle.text
                        )}
                      >
                        {org.type.replace("-", " ")}
                      </span>

                      {/* Email */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate text-[12px] text-slate-200">{org.createdBy.email}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                        <span className={cn("text-[11px] font-semibold capitalize", statusStyle.text)}>
                          {statusStyle.label}
                        </span>
                      </div>

                      {/* Actions */}
                      {org.status === "pending" && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(org.id)}
                            disabled={isApproving}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 transition-colors hover:bg-emerald-600/30 hover:text-emerald-300 disabled:opacity-50"
                            title="Approve request"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setRejectModal({ open: true, orgId: org.id, orgName: org.name })
                            }
                            disabled={isRejecting}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-colors hover:bg-red-600/30 hover:text-red-300 disabled:opacity-50"
                            title="Reject request"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                      {org.status !== "pending" && (
                        <div className="text-center text-[11px] text-caption">—</div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-[11px] text-caption">
              {organizations.length > 0
                ? `Showing page ${page} of ${totalPages}`
                : "No requests"}
            </p>
            <div className="flex items-center gap-0.5">
              <PaginationButton
                label="First page"
                icon={<ChevronFirst size={13} />}
                onClick={() => setPage(1)}
                disabled={page === 1}
              />
              <PaginationButton
                label="Previous page"
                icon={<ChevronLeft size={13} />}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              />
              <span className="h-7 min-w-7 rounded-full bg-blue-600 px-2 text-center text-xs font-medium leading-7 text-white">
                {page}
              </span>
              <span className="px-2 text-[11px] text-caption">of {formatNumberFull(totalPages)}</span>
              <PaginationButton
                label="Next page"
                icon={<ChevronRight size={13} />}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              />
              <PaginationButton
                label="Last page"
                icon={<ChevronLast size={13} />}
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
