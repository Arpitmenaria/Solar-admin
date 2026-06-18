"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TbChevronDown } from "react-icons/tb";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  hasError?: boolean;
  /** "sm" = compact filter use, "md" = form field (default) */
  size?: "sm" | "md";
  className?: string;
}

export function CustomSelect({
  value, onChange, options, hasError, size = "md", className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef    = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        menuRef.current    && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const isSm = size === "sm";

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border font-medium transition-all text-left",
          isSm ? "px-3 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          open
            ? "border-blue-500/50 bg-white/[0.05] text-slate-200"
            : hasError
              ? "border-red-500/50 bg-white/[0.03] text-slate-200 hover:bg-white/[0.05]"
              : "border-white/[0.10] bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.18]",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.16 }}
          className="shrink-0"
        >
          <TbChevronDown size={isSm ? 11 : 13} className={open ? "text-blue-400" : "text-caption"} />
        </motion.span>
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.94, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.94, y: -4 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                minWidth: Math.max(pos.width, 140),
                transformOrigin: "top left",
                zIndex: 9999,
              }}
              className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] py-1 shadow-2xl shadow-black/70"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center px-3.5 py-2.5 text-[12px] font-medium transition-colors text-left whitespace-nowrap",
                    value === opt.value
                      ? "text-white bg-blue-500/20"
                      : "text-white hover:bg-[rgba(255,255,255,0.07)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
