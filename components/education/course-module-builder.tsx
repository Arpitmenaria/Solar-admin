"use client";

import { useState } from "react";
import { TbChevronDown, TbGripVertical, TbPlus, TbTrash, TbVideo } from "react-icons/tb";
import type { CourseChapter, CourseModule } from "@/constants/education-mock-data";

interface CourseModuleBuilderProps {
  modules: CourseModule[];
  onChange: (modules: CourseModule[]) => void;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function reorder<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next.map((item, i) => ({ ...(item as object), order: i + 1 })) as T[];
}

export function CourseModuleBuilder({ modules, onChange }: CourseModuleBuilderProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(modules.map((m) => m.id)));

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addModule() {
    const id = newId("mod");
    onChange([...modules, { id, title: `Module ${modules.length + 1}`, order: modules.length + 1, chapters: [] }]);
    setExpanded((prev) => new Set(prev).add(id));
  }

  function removeModule(id: string) {
    onChange(modules.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i + 1 })));
  }

  function moveModule(index: number, dir: -1 | 1) {
    onChange(reorder(modules, index, dir));
  }

  function updateModuleTitle(id: string, title: string) {
    onChange(modules.map((m) => (m.id === id ? { ...m, title } : m)));
  }

  function addChapter(moduleId: string) {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, chapters: [...m.chapters, { id: newId("ch"), title: `Chapter ${m.chapters.length + 1}`, order: m.chapters.length + 1 }] }
          : m
      )
    );
  }

  function removeChapter(moduleId: string, chapterId: string) {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, chapters: m.chapters.filter((c) => c.id !== chapterId).map((c, i) => ({ ...c, order: i + 1 })) }
          : m
      )
    );
  }

  function moveChapter(moduleId: string, index: number, dir: -1 | 1) {
    onChange(
      modules.map((m) => (m.id === moduleId ? { ...m, chapters: reorder(m.chapters, index, dir) } : m))
    );
  }

  function updateChapter(moduleId: string, chapterId: string, patch: Partial<CourseChapter>) {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, chapters: m.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)) }
          : m
      )
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">
          Modules &amp; Chapters
        </h2>
        <button
          type="button"
          onClick={addModule}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600/15 px-3 py-1.5 text-[11px] font-semibold text-blue-300 transition-colors hover:bg-blue-600/25"
        >
          <TbPlus size={13} /> Add Module
        </button>
      </div>

      {modules.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/[0.12] px-5 py-8 text-center text-[12.5px] text-slate-500">
          No modules yet. Add one to start building the chapter outline.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {modules.map((module, mIndex) => {
          const isOpen = expanded.has(module.id);
          return (
            <div key={module.id} className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#0d1320]">
              <div className="flex items-center gap-2 px-3.5 py-3">
                <TbGripVertical size={15} className="shrink-0 text-slate-600" />
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                  className="flex-1 bg-transparent text-[13px] font-semibold text-white outline-none placeholder:text-slate-500"
                  placeholder="Module title"
                />
                <button type="button" onClick={() => moveModule(mIndex, -1)} disabled={mIndex === 0} className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30">
                  <TbChevronDown size={14} className="rotate-180" />
                </button>
                <button type="button" onClick={() => moveModule(mIndex, 1)} disabled={mIndex === modules.length - 1} className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30">
                  <TbChevronDown size={14} />
                </button>
                <button type="button" onClick={() => removeModule(module.id)} className="rounded p-1 text-slate-500 hover:bg-red-500/15 hover:text-red-300">
                  <TbTrash size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleExpanded(module.id)}
                  className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                >
                  <TbChevronDown size={16} className={`transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-white/[0.08] px-3.5 py-3">
                  <div className="flex flex-col gap-2.5">
                    {module.chapters.map((chapter, cIndex) => (
                      <div key={chapter.id} className="rounded-lg border border-white/[0.08] bg-[#0a0f1a] p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <TbVideo size={14} className="shrink-0 text-slate-500" />
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => updateChapter(module.id, chapter.id, { title: e.target.value })}
                            placeholder="Chapter title"
                            className="flex-1 bg-transparent text-[12.5px] font-medium text-white outline-none placeholder:text-slate-500"
                          />
                          <button type="button" onClick={() => moveChapter(module.id, cIndex, -1)} disabled={cIndex === 0} className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30">
                            <TbChevronDown size={12} className="rotate-180" />
                          </button>
                          <button type="button" onClick={() => moveChapter(module.id, cIndex, 1)} disabled={cIndex === module.chapters.length - 1} className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 disabled:opacity-30">
                            <TbChevronDown size={12} />
                          </button>
                          <button type="button" onClick={() => removeChapter(module.id, chapter.id)} className="rounded p-1 text-slate-500 hover:bg-red-500/15 hover:text-red-300">
                            <TbTrash size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={chapter.videoUrl ?? ""}
                          onChange={(e) => updateChapter(module.id, chapter.id, { videoUrl: e.target.value })}
                          placeholder="Video URL (https://...)"
                          className="mb-2 w-full rounded-md border border-white/[0.08] bg-[#0d1320] px-2.5 py-1.5 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60"
                        />
                        <textarea
                          value={chapter.notes ?? ""}
                          onChange={(e) => updateChapter(module.id, chapter.id, { notes: e.target.value })}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="w-full resize-none rounded-md border border-white/[0.08] bg-[#0d1320] px-2.5 py-1.5 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addChapter(module.id)}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-dashed border-white/[0.14] px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:border-blue-500/40 hover:text-blue-300"
                  >
                    <TbPlus size={12} /> Add Chapter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
