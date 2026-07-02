"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbGift, TbCreditCard } from "react-icons/tb";
import { BackButton } from "@/components/shared/back-button";
import { CustomSelect } from "@/components/shared/custom-select";
import type { Course, CourseCategory, CourseDifficulty, CourseStatus } from "@/constants/education-mock-data";
import { CATEGORY_OPTS, DIFFICULTY_OPTS, STATUS_OPTS } from "@/components/education/course-meta";

export interface CourseFormValues {
  title: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  instructorName: string;
  instructorAvatarUrl: string;
  duration: string;
  isFree: boolean;
  price: string;
  coverUrl: string;
  description: string;
  status: CourseStatus;
}

interface CourseFormProps {
  defaultValues?: Course;
  submitLabel: string;
  showStatus?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: CourseFormValues) => void;
}

export function CourseForm({ defaultValues, submitLabel, showStatus, isSubmitting, onSubmit }: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [category, setCategory] = useState<CourseCategory>(defaultValues?.category ?? "Design");
  const [difficulty, setDifficulty] = useState<CourseDifficulty>(defaultValues?.difficulty ?? "Beginner");
  const [status, setStatus] = useState<CourseStatus>(defaultValues?.status ?? "DRAFT");
  const [instructorName, setInstructorName] = useState(defaultValues?.instructor.name ?? "");
  const [instructorAvatarUrl, setInstructorAvatarUrl] = useState(defaultValues?.instructor.avatarUrl ?? "");
  const [duration, setDuration] = useState(defaultValues?.duration ?? "");
  const [isFree, setIsFree] = useState(defaultValues?.isFree ?? false);
  const [price, setPrice] = useState(defaultValues?.price ?? "");
  const [coverUrl, setCoverUrl] = useState(defaultValues?.coverUrl ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) { setError("Course title is required."); return; }
    if (!instructorName.trim()) { setError("Instructor name is required."); return; }
    if (!isFree && !price.trim()) { setError("Set a price, or mark the course as Free."); return; }
    setError("");
    onSubmit({
      title: title.trim(),
      category,
      difficulty,
      status,
      instructorName: instructorName.trim(),
      instructorAvatarUrl: instructorAvatarUrl.trim(),
      duration: duration.trim(),
      isFree,
      price: price.trim(),
      coverUrl: coverUrl.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {defaultValues && (
              <div className="mb-2.5">
                <BackButton href="/dashboard/education/courses" />
              </div>
            )}
            <h1 className="text-[20px] font-bold text-white sm:text-[26px]">
              {defaultValues ? "Edit Course" : "Create Course"}
            </h1>
            <p className="mt-1 text-[12.5px] text-caption sm:text-[13px]">
              {defaultValues ? `Update settings for "${defaultValues.title}".` : "Set up a new course."}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {!defaultValues && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/education/courses")}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-white/[0.12] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-white/[0.22] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 sm:flex-none sm:py-2"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-blue-700 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 sm:flex-none sm:py-2"
            >
              {isSubmitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </div>

      <main className="relative flex-1 px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-auto max-w-2xl rounded-xl border border-white/[0.08] bg-card p-5 sm:p-7 md:p-8"
        >
          <div className="flex flex-col gap-7">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[12px] font-medium text-red-300">
                {error}
              </div>
            )}

            <Field label="Course Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced UI Design Systems"
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Category">
                <CustomSelect
                  value={category}
                  onChange={(v) => setCategory(v as CourseCategory)}
                  options={CATEGORY_OPTS.map((c) => ({ value: c, label: c }))}
                />
              </Field>

              <Field label="Difficulty">
                <CustomSelect
                  value={difficulty}
                  onChange={(v) => setDifficulty(v as CourseDifficulty)}
                  options={DIFFICULTY_OPTS.map((d) => ({ value: d, label: d }))}
                />
              </Field>
            </div>

            {showStatus && (
              <Field label="Status">
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as CourseStatus)}
                  options={STATUS_OPTS.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
                />
              </Field>
            )}

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Instructor Name">
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Instructor Avatar URL (optional)">
                <input
                  type="text"
                  value={instructorAvatarUrl}
                  onChange={(e) => setInstructorAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Duration">
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 12h 30m"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Cover Image URL (optional)">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Pricing">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/[0.10]">
                  {([true, false] as const).map((free) => (
                    <button
                      key={String(free)}
                      type="button"
                      onClick={() => setIsFree(free)}
                      className={`flex flex-1 items-center justify-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                        isFree === free ? "bg-blue-600 text-white" : "bg-[#0d1320] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      {free ? <TbGift size={13} /> : <TbCreditCard size={13} />}
                      {free ? "Free" : "Paid"}
                    </button>
                  ))}
                </div>
              </Field>

              {!isFree && (
                <Field label="Price">
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. $89.99"
                    className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                  />
                </Field>
              )}
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What will students learn in this course?"
                className="w-full resize-none rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
