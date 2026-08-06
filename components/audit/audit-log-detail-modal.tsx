"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Flag } from "lucide-react";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useAuditLogDetail } from "@/hooks/use-audit-logs";
import { auditActionLabel } from "@/services/audit-logs.service";
import { na, cn } from "@/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-1.5">
      <span className="text-label">{label}</span>
      <span className="text-[12px] text-slate-200 break-words">{value}</span>
    </div>
  );
}

function NotifRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-[12px]", ok ? "text-emerald-300" : "text-caption")}>
      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full", ok ? "bg-emerald-500/20" : "bg-white/[0.06]")}>
        {ok ? <Check size={10} /> : <X size={10} />}
      </span>
      {label}: {ok ? "Yes" : "No"}
    </div>
  );
}

function fmtFull(ts: string): string {
  if (!ts) return "NA";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "NA";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

export function AuditLogDetailModal({ logId, onClose }: { logId: string | null; onClose: () => void }) {
  const { data: log, isLoading } = useAuditLogDetail(logId);

  useEffect(() => {
    if (!logId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [logId, onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {logId && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0d1321] shadow-2xl shadow-black/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h3 className="text-[14px] font-semibold text-white">Audit Log Detail</h3>
              <button onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-6 rounded" />)}</div>
              ) : !log ? (
                <p className="py-12 text-center text-sm text-caption">Couldn&apos;t load this entry.</p>
              ) : (
                <>
                  <Row label="Action" value={<span className="font-semibold text-white">{auditActionLabel(log.action)}</span>} />
                  <Row label="Admin" value={<>{na(log.adminName)} {log.adminEmail && <span className="text-caption">({log.adminEmail})</span>}</>} />
                  <Row label="Target User" value={na(log.targetAuthorName)} />
                  <Row label="Target Type" value={<span className="capitalize">{na(log.targetType)}</span>} />
                  <Row label="Target ID" value={<span className="font-mono text-[11px] text-caption">{na(log.targetId)}</span>} />
                  <Row label="Reason" value={na(log.reason)} />
                  <Row label="Notes" value={log.notes ? log.notes : <span className="italic text-caption">None</span>} />
                  <Row label="Status" value={
                    <span className="flex items-center gap-1.5">
                      <span className="text-caption">{log.statusBefore || "—"}</span>
                      <ArrowRight size={11} className="text-caption" />
                      <span className="text-slate-200">{log.statusAfter || "—"}</span>
                    </span>
                  } />
                  {log.ipAddress && <Row label="IP Address" value={<span className="font-mono text-[11px]">{log.ipAddress}</span>} />}
                  <Row label="Timestamp" value={fmtFull(log.createdAt)} />

                  <div className="my-4 space-y-2 border-t border-white/[0.06] pt-4">
                    <p className="text-label">NOTIFICATIONS</p>
                    <NotifRow ok={log.userNotified} label="User notified" />
                    <NotifRow ok={log.notificationSent} label="Panel notification" />
                    <NotifRow ok={log.emailSent} label="Email sent" />
                  </div>

                  {log.relatedReports.length > 0 && (
                    <div className="space-y-2 border-t border-white/[0.06] pt-4">
                      <p className="text-label">TRIGGERING REPORTS ({log.relatedReports.length})</p>
                      {log.relatedReports.map((r, i) => (
                        <div key={r.id || i} className="flex items-center gap-2 text-[12px] text-slate-300">
                          <Flag size={11} className="shrink-0 text-orange-300" />
                          <span className="truncate">
                            {r.reporterName ? `${r.reporterName} — ` : ""}
                            <span className="text-orange-300">{r.reason || "Report"}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
