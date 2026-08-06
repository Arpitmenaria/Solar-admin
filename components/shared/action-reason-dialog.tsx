"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_REASON = 5;

export interface ReasonPayload {
  reason: string;
  notes: string;
}

/**
 * Collects a required reason (min 5 chars) and optional notes before a
 * moderation action. Every admin action is audit-logged with this context,
 * so the reason is mandatory.
 */
export function ActionReasonDialog({
  open, title, description, confirmLabel, variant = "default", pending,
  onConfirm, onClose,
}: {
  open: boolean;
  title: string;
  description?: string | null;
  confirmLabel: string;
  variant?: "default" | "destructive";
  pending: boolean;
  onConfirm: (payload: ReasonPayload) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  // Reset the form each time the dialog opens.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setReason(""); setNotes(""); setTouched(false); }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON;

  const submit = () => {
    if (!valid) { setTouched(true); return; }
    onConfirm({ reason: trimmed, notes: notes.trim() });
  };

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
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0d1321] shadow-2xl shadow-black/70"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <div>
                <h3 className="text-[15px] font-semibold text-white">{title}</h3>
                {description && <p className="mt-1 text-[12px] text-caption">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="action-reason" className="text-label mb-1.5 block">
                  REASON <span className="text-red-400">*</span>
                </label>
                <input
                  id="action-reason"
                  type="text"
                  value={reason}
                  autoFocus
                  onChange={(e) => setReason(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Why is this action being taken?"
                  aria-invalid={touched && !valid}
                  className={cn(
                    "w-full rounded-lg border bg-white/[0.03] px-3 py-2 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:bg-white/[0.05] focus:outline-none",
                    touched && !valid
                      ? "border-red-500/50 focus:border-red-500/60"
                      : "border-white/[0.08] focus:border-blue-500/40"
                  )}
                />
                {touched && !valid && (
                  <p className="mt-1 text-[11px] text-red-400">
                    Reason is required (at least {MIN_REASON} characters).
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="action-notes" className="text-label mb-1.5 block">
                  NOTES <span className="text-caption">(optional)</span>
                </label>
                <textarea
                  id="action-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional context for the audit log…"
                  className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-slate-200 placeholder:text-[#2e3d57] transition-all focus:border-blue-500/40 focus:bg-white/[0.05] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
              <button
                onClick={onClose}
                disabled={pending}
                className="rounded-lg border border-white/[0.12] px-3.5 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-[12px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  variant === "destructive" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
                )}
              >
                {pending ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
