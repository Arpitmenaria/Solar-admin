"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { TbPencil, TbCloudUpload, TbTrash } from "react-icons/tb";
import { FileText } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useResource } from "@/hooks/use-library";
import { formatDate } from "@/lib/utils";
import { CAT_BADGE, CATEGORY_ICON } from "@/components/education/course-meta";
import { STATUS_STYLES, TYPE_BADGE, TYPE_ICON } from "@/components/education/resource-meta";
import { ResourceActionDialog, type PendingResourceAction } from "@/components/education/resource-action-dialog";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: resource, isLoading } = useResource(id);
  const [pendingAction, setPendingAction] = useState<PendingResourceAction | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!resource) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Resource not found</div>;
  }

  const st = STATUS_STYLES[resource.status];
  const TypeIcon = TYPE_ICON[resource.type];
  const CatIcon = CATEGORY_ICON[resource.category];

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 space-y-5 p-4 md:p-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <BackButton href="/dashboard/education/library" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative">
          <div className="relative h-40 overflow-hidden rounded-xl border border-white/[0.08] sm:h-52">
            {resource.type === "Video" && resource.videoUrl ? (
              <video src={resource.videoUrl} poster={resource.coverUrl} controls className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resource.coverUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{resource.title}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-2.5 py-1 text-[11px] font-semibold">
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                <span className={st.text}>{st.label}</span>
              </span>
              <span className={`inline-flex w-fit items-center gap-1 rounded border px-2 py-[3px] text-[10px] font-semibold ${TYPE_BADGE[resource.type]}`}>
                <TypeIcon size={11} /> {resource.type}
              </span>
              <span className={`inline-flex w-fit items-center gap-1 rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide ${CAT_BADGE[resource.category]}`}>
                <CatIcon size={11} /> {resource.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {resource.author ? `${resource.author.name} · ` : ""}Created {formatDate(resource.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/dashboard/education/library/${resource.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <TbPencil size={14} /> Edit Resource
            </Link>
            {resource.status !== "PUBLISHED" && (
              <button
                onClick={() => setPendingAction({ action: "PUBLISH", resourceId: resource.id, resourceName: resource.title })}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-[12px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                <TbCloudUpload size={14} /> Publish
              </button>
            )}
            <button
              onClick={() => setPendingAction({ action: "DELETE", resourceId: resource.id, resourceName: resource.title })}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <TbTrash size={14} /> Delete Resource
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-4 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Content</h2>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {resource.content ?? "No content has been added yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] text-slate-400">{tag}</span>
            ))}
          </div>
        </motion.div>
      </main>

      <ResourceActionDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onSuccess={(action) => { if (action === "DELETE") router.push("/dashboard/education/library"); }}
      />
    </div>
  );
}
