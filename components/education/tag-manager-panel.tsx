"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tags, Pencil, Check, X, Trash2 } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/shared/loading-skeleton";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteTag, useRenameTag, useTags } from "@/hooks/use-library";

export function TagManagerPanel() {
  const { data: tags, isLoading } = useTags();
  const renameTag = useRenameTag();
  const deleteTag = useDeleteTag();

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function startEdit(label: string) {
    setEditing(label);
    setDraft(label);
  }

  function commitEdit(oldLabel: string) {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === oldLabel) { setEditing(null); return; }
    renameTag.mutate(
      { oldLabel, newLabel: trimmed },
      {
        onSuccess: () => toast.success(`Renamed "${oldLabel}" to "${trimmed}".`),
        onError: () => toast.error("Something went wrong. Please try again."),
      }
    );
    setEditing(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const label = pendingDelete;
    deleteTag.mutate(label, {
      onSuccess: () => toast.success(`Deleted tag "${label}".`),
      onError: () => toast.error("Something went wrong. Please try again."),
    });
    setPendingDelete(null);
  }

  return (
    <>
      <SectionCard title="Tags" icon={Tags}>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : !tags || tags.length === 0 ? (
          <div className="py-8 text-center text-[12.5px] text-slate-500">No tags yet — tags appear here once resources use them.</div>
        ) : (
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {tags.map((tag) => (
              <div key={tag.label} className="flex items-center justify-between gap-3 py-3">
                {editing === tag.label ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitEdit(tag.label); if (e.key === "Escape") setEditing(null); }}
                      className="flex-1 rounded-md border border-blue-500/50 bg-[#0d1320] px-2.5 py-1.5 text-[13px] text-white outline-none"
                    />
                    <button type="button" onClick={() => commitEdit(tag.label)} className="rounded p-1.5 text-emerald-400 hover:bg-emerald-500/15">
                      <Check size={15} />
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded p-1.5 text-slate-400 hover:bg-white/[0.06]">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate text-[13px] font-medium text-white">{tag.label}</span>
                      <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-slate-400">
                        {tag.count} {tag.count === 1 ? "resource" : "resources"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button type="button" onClick={() => startEdit(tag.label)} className="rounded p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setPendingDelete(tag.label)} className="rounded p-1.5 text-slate-400 hover:bg-red-500/15 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tag?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `"${pendingDelete}" will be removed from every resource that uses it.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
