"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TbPlus, TbSearch, TbRefresh, TbTags, TbPencil, TbTrash, TbCloudUpload } from "react-icons/tb";
import { CustomSelect } from "@/components/shared/custom-select";
import { cn } from "@/lib/utils";
import type { CourseCategory, ResourceType } from "@/constants/education-mock-data";
import { useResources } from "@/hooks/use-library";
import { CATEGORY_ICON, CATEGORY_OPTS } from "@/components/education/course-meta";
import { STATUS_STYLES, TYPE_BADGE, TYPE_ICON, TYPE_OPTS } from "@/components/education/resource-meta";
import { ResourceActionDialog, type PendingResourceAction } from "@/components/education/resource-action-dialog";

const TYPE_TABS: { label: string; id: "ALL" | ResourceType }[] = [
  { label: "All", id: "ALL" },
  ...TYPE_OPTS.map((t) => ({ label: t + "s", id: t })),
];

export default function LibraryPage() {
  const { data: resources = [] } = useResources();
  const [activeTab, setActiveTab] = useState<"ALL" | ResourceType>("ALL");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | CourseCategory>("ALL");
  const [pendingAction, setPendingAction] = useState<PendingResourceAction | null>(null);

  const resetFilters = () => { setSearch(""); setCategory("ALL"); };

  const filtered = resources.filter((r) => {
    if (activeTab !== "ALL" && r.type !== activeTab) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.tags.some((t) => t.includes(search.toLowerCase()))) return false;
    if (category !== "ALL" && r.category !== category) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 space-y-6 p-4 md:p-6">

        <div className="overflow-x-auto border-b border-white/[0.08]" style={{ scrollbarWidth: "none" }}>
          <div className="flex min-w-max">
            {TYPE_TABS.map((tab, i) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
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

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-card px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-caption">Category</span>
            <CustomSelect size="sm" value={category} onChange={(v) => setCategory(v as typeof category)}
              options={[{ value: "ALL", label: "All Categories" }, ...CATEGORY_OPTS.map((c) => ({ value: c, label: c }))]} />
          </div>
          <div className="relative">
            <TbSearch size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-caption" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or tag..."
              className="w-52 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-7 pr-3 text-[11px] text-slate-200 placeholder:text-caption focus:border-blue-500/40 focus:outline-none" />
          </div>
          <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-medium text-[#99CBFF] transition-colors hover:text-white">
            <TbRefresh size={12} /> Reset
          </button>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/education/library/tags"
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              <TbTags size={12} /> Manage Tags
            </Link>
            <Link
              href="/dashboard/education/library/create"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <TbPlus size={12} /> Create Resource
            </Link>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.12] py-16 text-center text-sm text-caption">
                No resources match the current filters.
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                {filtered.map((resource, i) => {
                  const TypeIcon = TYPE_ICON[resource.type];
                  const CatIcon = CATEGORY_ICON[resource.category];
                  const st = STATUS_STYLES[resource.status];
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="overflow-hidden rounded-xl border border-white/[0.08] bg-card"
                    >
                      <div className="relative h-32 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resource.coverUrl} alt="" className="h-full w-full object-cover" />
                        <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded border px-2 py-[3px] text-[10px] font-semibold ${TYPE_BADGE[resource.type]} bg-[#0d1321]/80 backdrop-blur-sm`}>
                          <TypeIcon size={11} /> {resource.type}
                        </span>
                        <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#0d1321]/80 px-2 py-[3px] text-[10px] font-semibold backdrop-blur-sm">
                          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          <span className={st.text}>{st.label}</span>
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500">
                          <CatIcon size={12} /> {resource.category}
                        </div>
                        <h3 className="mb-1 truncate text-[13.5px] font-semibold text-white">{resource.title}</h3>
                        <p className="mb-3 line-clamp-2 text-[12px] text-slate-400">{resource.content}</p>
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/education/library/${resource.id}/edit`}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            <TbPencil size={12} /> Edit
                          </Link>
                          {resource.status !== "PUBLISHED" && (
                            <button
                              onClick={() => setPendingAction({ action: "PUBLISH", resourceId: resource.id, resourceName: resource.title })}
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                            >
                              <TbCloudUpload size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => setPendingAction({ action: "DELETE", resourceId: resource.id, resourceName: resource.title })}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            <TbTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ResourceActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}
