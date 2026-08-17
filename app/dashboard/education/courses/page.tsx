"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbSearch, TbRefresh,
  TbChevronsLeft, TbChevronsRight, TbChevronLeft, TbChevronRight,
  TbSchool, TbDotsVertical, TbEye, TbTrash,
} from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import { UserAvatar } from "@/components/shared/user-avatar";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import type { Course, CourseCategory, CourseDifficulty, CourseStatus } from "@/constants/education-mock-data";
import { useCourses, useCourseStats } from "@/hooks/use-courses";
import { CATEGORY_ICON, CAT_BADGE, DIFFICULTY_BADGE, STATUS_STYLES, CATEGORY_OPTS, DIFFICULTY_OPTS } from "@/components/education/course-meta";
import { CourseActionDialog, type PendingCourseAction } from "@/components/education/course-action-dialog";

const STATUS_TABS: { label: string; id: "ALL" | CourseStatus }[] = [
  { label: "All Courses", id: "ALL" },
  { label: "Published", id: "PUBLISHED" },
];

function ActionMenu({ course, onAction }: { course: Course; onAction: (action: "DELETE") => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label={`Actions for ${course.title}`}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
          open ? "bg-white/[0.12] text-white" : "text-caption hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        <TbDotsVertical size={15} />
      </button>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.88, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: pos.top, right: pos.right, transformOrigin: "top right", zIndex: 40 }}
              className="w-44 overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1424] shadow-2xl shadow-black/70"
            >
              <Link
                href={`/dashboard/education/courses/${course.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[rgba(255,255,255,0.07)]"
              >
                <TbEye size={14} /> View Details
              </Link>
              <button
                onClick={() => { setOpen(false); onAction("DELETE"); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 transition-colors hover:bg-[rgba(239,68,68,0.12)]"
              >
                <TbTrash size={14} /> Delete Course
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useCourses();
  const { data: stats } = useCourseStats();
  const [activeTab, setActiveTab] = useState<"ALL" | CourseStatus>("ALL");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | CourseCategory>("ALL");
  const [difficulty, setDifficulty] = useState<"ALL" | CourseDifficulty>("ALL");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingCourseAction | null>(null);

  const resetFilters = () => {
    setSearch(""); setCategory("ALL"); setDifficulty("ALL"); setPage(1);
  };

  const filtered = courses.filter((c) => {
    if (activeTab !== "ALL" && c.status !== activeTab) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "ALL" && c.category !== category) return false;
    if (difficulty !== "ALL" && c.difficulty !== difficulty) return false;
    return true;
  });

  const statValue = activeTab === "ALL" ? stats?.totalCourses ?? 0 : stats?.published ?? 0;

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">

        <div className="overflow-x-auto border-b border-white/[0.08]" style={{ scrollbarWidth: "none" }}>
          <div className="flex min-w-max">
            {STATUS_TABS.map((tab, i) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setActiveTab(tab.id); resetFilters(); }}
                className={cn(
                  "relative px-8 py-4 text-left shrink-0 border-b-2 transition-colors duration-150",
                  activeTab === tab.id ? "border-blue-500 text-white" : "border-transparent text-caption hover:text-slate-300 hover:border-white/[0.12]"
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }} className="space-y-5">

            <div className="flex flex-col xl:flex-row items-stretch gap-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="w-full xl:w-[240px] shrink-0 rounded-xl border border-white/[0.08] bg-card p-5 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.04] hover:-translate-y-[2px] hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-caption leading-snug pr-2">
                    {STATUS_TABS.find((t) => t.id === activeTab)?.label}
                  </p>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
                    <TbSchool size={15} style={{ color: "#4d6b90" }} />
                  </div>
                </div>
                <p className="text-[34px] font-bold leading-none tracking-tight text-[#99CBFF]">{statValue}</p>
                <p className="mt-2.5 text-[11px] text-[#99CBFF]">
                  {stats ? `${stats.freeCourses} free · ${stats.paidCourses} paid` : ""}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                className="flex-1 rounded-xl border border-white/[0.08] bg-card px-5 py-3.5 flex items-center gap-3 flex-wrap"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Category</span>
                  <CustomSelect size="sm" value={category} onChange={(v) => { setCategory(v as typeof category); setPage(1); }}
                    options={[{ value: "ALL", label: "All Categories" }, ...CATEGORY_OPTS.map((c) => ({ value: c, label: c }))]} />
                </div>
                <div className="h-4 w-px bg-white/[0.08] shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Difficulty</span>
                  <CustomSelect size="sm" value={difficulty} onChange={(v) => { setDifficulty(v as typeof difficulty); setPage(1); }}
                    options={[{ value: "ALL", label: "All Levels" }, ...DIFFICULTY_OPTS.map((d) => ({ value: d, label: d }))]} />
                </div>
                <div className="relative">
                  <TbSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
                  <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search courses..."
                    className="w-40 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-7 pr-3 text-[11px] text-slate-200 placeholder:text-caption focus:border-blue-500/40 focus:outline-none" />
                </div>
                <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
                  <TbRefresh size={12} /> Reset
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.22 }}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-card"
            >
              <div className="overflow-x-auto">
              <div className="grid grid-cols-[2.2fr_120px_110px_150px_100px_100px_120px_60px] gap-4 border-b border-white/[0.07] bg-white/[0.025] px-6 py-4 min-w-[1120px]">
                {["COURSE", "CATEGORY", "DIFFICULTY", "INSTRUCTOR", "PRICE", "ENROLLED", "STATUS", "ACTIONS"].map((label) => (
                  <span key={label} className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 ${label === "ENROLLED" || label === "ACTIONS" ? "text-center" : ""}`}>
                    {label}
                  </span>
                ))}
              </div>

              {isLoading ? (
                <div className="px-6 min-w-[1120px]">{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
              ) : filtered.map((course, i) => {
                const CatIcon = CATEGORY_ICON[course.category];
                const st = STATUS_STYLES[course.status];
                return (
                  <motion.div key={course.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[2.2fr_120px_110px_150px_100px_100px_120px_60px] items-center gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.02] min-w-[1120px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
                        <CatIcon size={16} className="text-blue-300" />
                      </div>
                      <span className="truncate text-[13px] font-semibold text-white">{course.title}</span>
                    </div>

                    <span className={`inline-flex w-fit items-center rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide ${CAT_BADGE[course.category]}`}>
                      {course.category}
                    </span>

                    <span className={`inline-flex w-fit items-center rounded px-2 py-[3px] text-[10px] font-semibold ${DIFFICULTY_BADGE[course.difficulty]}`}>
                      {course.difficulty}
                    </span>

                    <div className="flex min-w-0 items-center gap-2">
                      <UserAvatar src={course.instructor.avatarUrl} name={course.instructor.name} size="sm" />
                      <span className="truncate text-[12px] text-slate-200">{course.instructor.name}</span>
                    </div>

                    <span className="text-[12.5px] font-medium text-slate-200">
                      {course.isFree ? <span className="text-emerald-400">Free</span> : course.price}
                    </span>

                    <span className="text-center text-[13px] font-medium text-slate-200">{course.enrolledCount}</span>

                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[11px] font-semibold ${st.text}`}>{st.label}</span>
                    </div>

                    <ActionMenu course={course} onAction={(action) => setPendingAction({ action, courseId: course.id, courseName: course.title })} />
                  </motion.div>
                );
              })}

              {!isLoading && filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-caption">No courses match the current filters.</div>
              )}
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.04] px-6 py-4">
                <p className="text-[11px] text-caption">Showing {filtered.length} of {courses.length} courses</p>
                <div className="flex items-center gap-0.5">
                  {([TbChevronsLeft, TbChevronLeft] as React.ElementType[]).map((Icon, i) => (
                    <button key={i} onClick={() => setPage(Math.max(1, page - 1))} className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300">
                      <Icon size={13} />
                    </button>
                  ))}
                  <span className={`h-7 w-7 rounded-full text-xs font-medium bg-blue-600 text-white flex items-center justify-center`}>{page}</span>
                  {([TbChevronRight, TbChevronsRight] as React.ElementType[]).map((Icon, i) => (
                    <button key={i} onClick={() => setPage(page + 1)} className="flex h-7 w-7 items-center justify-center rounded text-caption transition-colors hover:bg-white/[0.06] hover:text-slate-300">
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      <CourseActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}
