"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useUserReporters } from "@/hooks/use-users";
import { formatNumberFull, formatDate, na } from "@/lib/utils";

export function ReportedByModal({
  userId, userName, open, onClose,
}: {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);

  // Reset to the first page each time the modal is (re)opened. Done during
  // render per React's "adjust state on prop change" pattern.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPage(1);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { data, isLoading, isError } = useUserReporters(userId, page, open);
  const people = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0d1321] shadow-2xl shadow-black/70"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-red-400" />
                  <h3 className="text-[14px] font-semibold text-white">Reported By</h3>
                  {data && (
                    <span className="rounded-full bg-red-500/[0.12] px-2 py-0.5 text-[11px] font-semibold text-red-300">
                      {formatNumberFull(data.total)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-caption">Users who reported {na(userName)}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-[200px] flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <p className="py-16 text-center text-sm text-caption">Couldn&apos;t load this list.</p>
              ) : people.length === 0 ? (
                <p className="py-16 text-center text-sm text-caption">No reports filed against this user.</p>
              ) : (
                people.map((p) => (
                  <Link
                    key={p.id + p.reportedAt}
                    href={`/dashboard/users/${p.id}`}
                    onClick={onClose}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <UserAvatar src={p.avatarUrl} name={p.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-white">{na(p.fullName)}</p>
                        {p.isSuspended && <StatusBadge status="INACTIVE" />}
                      </div>
                      {p.reason && (
                        <p className="mt-0.5 truncate text-[11px] text-orange-300" title={p.reason}>
                          {p.reason}
                        </p>
                      )}
                      {p.reportedAt && (
                        <p className="mt-0.5 text-[10px] text-caption">{formatDate(p.reportedAt)}</p>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer / pagination */}
            {data && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
                <span className="text-[11px] text-caption">Page {page} of {formatNumberFull(totalPages)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
