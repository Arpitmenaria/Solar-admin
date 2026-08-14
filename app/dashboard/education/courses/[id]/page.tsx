"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbCloudUpload, TbTrash, TbVideo } from "react-icons/tb";
import { BookOpen } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useCourse } from "@/hooks/use-courses";
import { formatDate, cn } from "@/lib/utils";
import { CAT_BADGE, CATEGORY_ICON, DIFFICULTY_BADGE, STATUS_STYLES } from "@/components/education/course-meta";
import { CourseActionDialog, type PendingCourseAction } from "@/components/education/course-action-dialog";
import { EnrollmentList } from "@/components/education/enrollment-list";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const TABS = [
  { value: "about", label: "About" },
  { value: "modules", label: "Modules" },
  { value: "enrollments", label: "Enrollments" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourse(id);
  const [pendingAction, setPendingAction] = useState<PendingCourseAction | null>(null);
  const [tab, setTab] = useState<TabValue>("about");

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-muted-foreground">Course not found</div>
      </div>
    );
  }

  const st = STATUS_STYLES[course.status];
  const CatIcon = CATEGORY_ICON[course.category];
  const totalChapters = course.modules.reduce((sum, m) => sum + m.chapters.length, 0);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/education/courses" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative">
          <div className="relative h-32 overflow-hidden rounded-xl border border-white/[0.08] sm:h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 left-6 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#080c16] bg-[#0d1321] sm:h-24 sm:w-24">
            <CatIcon size={28} className="text-blue-300" />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="flex flex-col gap-4 pl-0 pt-8 sm:flex-row sm:items-start sm:justify-between sm:pl-[136px] sm:pt-0"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{course.title}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                <span className={st.text}>{st.label}</span>
              </span>
              <span className={`inline-flex w-fit items-center rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide ${CAT_BADGE[course.category]}`}>
                {course.category}
              </span>
              <span className={`inline-flex w-fit items-center rounded px-2 py-[3px] text-[10px] font-semibold ${DIFFICULTY_BADGE[course.difficulty]}`}>
                {course.difficulty}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.isFree ? "Free" : course.price} &middot; {course.duration} &middot; {course.instructor.name} &middot; Created {formatDate(course.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {course.status !== "PUBLISHED" && (
              <button
                onClick={() => setPendingAction({ action: "PUBLISH", courseId: course.id, courseName: course.title })}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                <TbCloudUpload size={14} /> Publish
              </button>
            )}

            <button
              onClick={() => setPendingAction({ action: "DELETE", courseId: course.id, courseName: course.title })}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <TbTrash size={14} /> Delete Course
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative border-b border-white/[0.08]">
          <div className="flex gap-6">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "relative pb-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                    active ? "text-blue-400" : "text-caption hover:text-white"
                  )}
                >
                  {t.label}
                  {active && <span className="absolute -bottom-px left-0 h-[2px] w-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {tab === "about" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">About this Course</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              {course.description ?? "No description has been provided for this course yet."}
            </p>
          </motion.div>
        )}

        {tab === "modules" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TbVideo size={16} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Modules &amp; Chapters</h2>
              </div>
              <span className="text-[11px] text-caption">
                {course.modules.length} modules &middot; {totalChapters} chapters
              </span>
            </div>
            {course.modules.length === 0 ? (
              <div className="py-8 text-center text-sm text-caption">No modules have been added yet.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="rounded-lg border border-white/[0.08] bg-[#0a0f1a]">
                    <div className="border-b border-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white">
                      {module.title}
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                      {module.chapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center gap-2.5 px-4 py-2.5">
                          <TbVideo size={13} className={chapter.videoUrl ? "text-blue-400" : "text-slate-600"} />
                          <span className="text-[12.5px] text-slate-300">{chapter.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "enrollments" && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-6">
            <EnrollmentList courseId={course.id} />
          </motion.div>
        )}
      </main>

      <CourseActionDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onSuccess={(action) => { if (action === "DELETE") router.push("/dashboard/education/courses"); }}
      />
    </div>
  );
}
