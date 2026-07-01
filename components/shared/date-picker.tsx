"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** ISO date "YYYY-MM-DD", or "" for no selection */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatMMDDYYYY(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

export function DatePicker({ value, onChange, placeholder = "mm/dd/yyyy", size = "sm", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selected = value ? value.split("-").map(Number) : null;
  const [viewYear, setViewYear] = useState(selected ? selected[0] : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected ? selected[1] - 1 : today.getMonth());

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    if (selected) {
      setViewYear(selected[0]);
      setViewMonth(selected[1] - 1);
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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayIso = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1);
  };

  const isSm = size === "sm";

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        aria-label="Filter by date"
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border font-medium transition-all text-left",
          isSm ? "px-3 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          open
            ? "border-blue-500/50 bg-white/[0.05] text-slate-200"
            : "border-white/[0.08] bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.18]"
        )}
      >
        <CalendarDays size={isSm ? 13 : 14} className={value ? "text-blue-400" : "text-[#3a4d6a]"} />
        <span className={cn("truncate", !value && "text-[#3a4d6a]")}>
          {value ? formatMMDDYYYY(value) : placeholder}
        </span>
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
              style={{ position: "fixed", top: pos.top, left: pos.left, transformOrigin: "top left", zIndex: 9999 }}
              className="w-[264px] overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] p-3 shadow-2xl shadow-black/70"
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  aria-label="Previous month"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[12px] font-semibold text-white">{monthLabel}</span>
                <button
                  type="button"
                  onClick={goNextMonth}
                  aria-label="Next month"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-caption transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 px-1">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="flex h-6 items-center justify-center text-[10px] font-semibold text-[#3a4d6a]">
                    {d}
                  </span>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <span key={`pad-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const iso = toISODate(viewYear, viewMonth, day);
                  const isSelected = value === iso;
                  const isToday = iso === todayIso;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => { onChange(iso); setOpen(false); }}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[11.5px] font-medium transition-colors",
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isToday
                            ? "border border-blue-500/40 text-blue-300"
                            : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); }}
                  className="mt-2 w-full rounded-lg border border-white/[0.08] py-1.5 text-[11px] font-medium text-[#99CBFF] transition-colors hover:bg-white/[0.05]"
                >
                  Clear date
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
