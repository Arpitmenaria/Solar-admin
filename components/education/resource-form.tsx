"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TbX } from "react-icons/tb";
import { BackButton } from "@/components/shared/back-button";
import { CustomSelect } from "@/components/shared/custom-select";
import type { CourseCategory, LibraryResource, ResourceStatus, ResourceType } from "@/constants/education-mock-data";
import { CATEGORY_OPTS } from "@/components/education/course-meta";
import { STATUS_OPTS, TYPE_OPTS } from "@/components/education/resource-meta";

export interface ResourceFormValues {
  title: string;
  type: ResourceType;
  category: CourseCategory;
  tags: string[];
  authorName: string;
  authorAvatarUrl: string;
  coverUrl: string;
  videoUrl: string;
  content: string;
  status: ResourceStatus;
}

interface ResourceFormProps {
  defaultValues?: LibraryResource;
  submitLabel: string;
  showStatus?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: ResourceFormValues) => void;
}

export function ResourceForm({ defaultValues, submitLabel, showStatus, isSubmitting, onSubmit }: ResourceFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [type, setType] = useState<ResourceType>(defaultValues?.type ?? "Article");
  const [category, setCategory] = useState<CourseCategory>(defaultValues?.category ?? "Design");
  const [status, setStatus] = useState<ResourceStatus>(defaultValues?.status ?? "DRAFT");
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [authorName, setAuthorName] = useState(defaultValues?.author?.name ?? "");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState(defaultValues?.author?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(defaultValues?.coverUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(defaultValues?.videoUrl ?? "");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [error, setError] = useState("");

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  const handleSubmit = () => {
    if (!title.trim()) { setError("Resource title is required."); return; }
    setError("");
    onSubmit({
      title: title.trim(),
      type,
      category,
      status,
      tags,
      authorName: authorName.trim(),
      authorAvatarUrl: authorAvatarUrl.trim(),
      coverUrl: coverUrl.trim(),
      videoUrl: videoUrl.trim(),
      content: content.trim(),
    });
  };

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {defaultValues && (
              <div className="mb-2.5">
                <BackButton href="/dashboard/education/library" />
              </div>
            )}
            <h1 className="text-[20px] font-bold text-white sm:text-[26px]">
              {defaultValues ? "Edit Resource" : "Create Resource"}
            </h1>
            <p className="mt-1 text-[12.5px] text-caption sm:text-[13px]">
              {defaultValues ? `Update settings for "${defaultValues.title}".` : "Add a new library resource."}
            </p>
          </motion.div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {!defaultValues && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/education/library")}
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

            <Field label="Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand Identity Blueprint"
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Type">
                <CustomSelect
                  value={type}
                  onChange={(v) => setType(v as ResourceType)}
                  options={TYPE_OPTS.map((t) => ({ value: t, label: t }))}
                />
              </Field>

              <Field label="Category">
                <CustomSelect
                  value={category}
                  onChange={(v) => setCategory(v as CourseCategory)}
                  options={CATEGORY_OPTS.map((c) => ({ value: c, label: c }))}
                />
              </Field>
            </div>

            {showStatus && (
              <Field label="Status">
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as ResourceStatus)}
                  options={STATUS_OPTS.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))}
                />
              </Field>
            )}

            <Field label="Tags">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.10] bg-[#0d1320] px-2.5 py-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-white">
                      <TbX size={11} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTag}
                  placeholder="Type a tag and press Enter"
                  className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[12.5px] text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Author Name (optional)">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>

              <Field label="Author Avatar URL (optional)">
                <input
                  type="text"
                  value={authorAvatarUrl}
                  onChange={(e) => setAuthorAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            </div>

            <Field label="Cover Image URL (optional)">
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
              />
            </Field>

            {type === "Video" && (
              <Field label="Video URL">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/[0.10] bg-[#0d1320] px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
                />
              </Field>
            )}

            <Field label="Content">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Full resource content — separate paragraphs with a blank line."
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
