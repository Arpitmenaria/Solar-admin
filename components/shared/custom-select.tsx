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

interface MenuPos {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
}

export function CustomSelect({
  value, onChange, options, hasError, size = "md", className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState<MenuPos>({ top: 0, left: 0, width: 0, maxHeight: 288, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef    = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const gap = 4;
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const spaceAbove = r.top - gap;
      // Flip above the trigger when there isn't enough room below — a long
      // options list (e.g. every user) would otherwise render mostly
      // off-screen with no way to reach it.
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
      // Capped well under the available space on purpose — this floats over
      // a data table, so a shorter panel that scrolls sooner covers fewer
      // rows than one that stretches to fill all the room it could.
      const maxHeight = Math.max(160, Math.min(220, (openUp ? spaceAbove : spaceBelow)));
      setPos({
        top: openUp ? r.top - gap : r.bottom + gap,
        left: r.left,
        width: r.width,
        maxHeight,
        openUp,
      });
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
              initial={{ opacity: 0, scale: 0.94, y: pos.openUp ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.94, y: pos.openUp ? 4 : -4 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                [pos.openUp ? "bottom" : "top"]: pos.openUp ? window.innerHeight - pos.top : pos.top,
                left: pos.left,
                minWidth: Math.max(pos.width, 140),
                maxWidth: 280,
                maxHeight: pos.maxHeight,
                transformOrigin: pos.openUp ? "bottom left" : "top left",
                zIndex: 9999,
              }}
              className="overflow-y-auto rounded-xl border border-white/[0.16] bg-[#0d1424] py-1 shadow-2xl shadow-black/80 ring-1 ring-black/40"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center px-3.5 py-2.5 text-[12px] font-medium transition-colors text-left truncate",
                    value === opt.value
                      ? "text-white bg-blue-500/20"
                      : "text-white hover:bg-[rgba(255,255,255,0.07)]"
                  )}
                  title={opt.label}
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
