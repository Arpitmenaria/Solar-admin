"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, MessageCircle, ShieldCheck, Trash2 } from "lucide-react";

import { BackButton } from "@/components/shared/back-button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  useConversationReportDetail, useConversationContent,
  useDeleteConversation, useDismissConversationReports,
} from "@/hooks/use-message-reports";
import { formatDate, na, cn } from "@/lib/utils";
import type { ConversationMessage } from "@/types";

type PendingAction = "delete" | "dismiss";

export default function ConversationReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useConversationReportDetail(id);
  const { data: content, isLoading: contentLoading } = useConversationContent(id);
  const deleteConversation = useDeleteConversation();
  const dismissReports = useDismissConversationReports();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const busy = deleteConversation.isPending || dismissReports.isPending;
  const pendingCount = data?.reports.filter((r) => r.status === "PENDING").length ?? 0;

  const confirmAction = () => {
    if (!pendingAction || !data) return;
    const name = na(data.chat.name);

    if (pendingAction === "delete") {
      deleteConversation.mutate(data.conversationId, {
        onSuccess: () => {
          toast.success(`Conversation "${name}" deleted and its reports resolved.`);
          router.push("/dashboard/reported-messages");
        },
        onError: () => toast.error("Couldn't delete this conversation. Please try again."),
      });
    } else {
      dismissReports.mutate(data.conversationId, {
        onSuccess: () => toast.success(`Reports on "${name}" dismissed.`),
        onError: () => toast.error("Couldn't dismiss these reports. Please try again."),
      });
    }
    setPendingAction(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-5 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Conversation not found</div>;
  }

  const ChatIcon = data.chat.type === "group" ? Users : MessageCircle;

  return (
    <div className="relative flex flex-1 flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <BackButton href="/dashboard/reported-messages" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{na(data.chat.name)}</h1>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-[2px] text-[10px] font-semibold tracking-wide",
                data.chat.type === "group" ? "border-blue-500/30 text-blue-300" : "border-purple-500/30 text-purple-300"
              )}
            >
              <ChatIcon size={9} strokeWidth={2.4} />
              {data.chat.type === "group" ? "Group Chat" : "Direct Message"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.reports.length} report{data.reports.length === 1 ? "" : "s"} filed against this conversation
          </p>
        </motion.div>

        {pendingCount > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setPendingAction("dismiss")}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3.5 py-2 text-[12px] font-medium text-emerald-300 transition-colors hover:bg-emerald-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={14} /> Dismiss All Reports
            </button>
            <button
              onClick={() => setPendingAction("delete")}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3.5 py-2 text-[12px] font-medium text-red-300 transition-colors hover:bg-red-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} /> Delete Conversation
            </button>
          </div>
        )}

        <div className="space-y-3">
          {data.reports.map((report) => (
            <div key={report.reportId} className="rounded-xl border border-white/[0.08] bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar src={report.reporter.avatarUrl} name={report.reporter.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {na(report.reporter.fullName)}
                    </p>
                    <p className="text-[11px] text-caption">Reported {formatDate(report.reportedAt)}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded border px-2 py-[3px] text-[10px] font-semibold tracking-wide",
                    report.status === "PENDING"
                      ? "border-amber-500/30 text-amber-300"
                      : "border-emerald-500/30 text-emerald-300"
                  )}
                >
                  {report.status === "PENDING" ? "Pending" : "Resolved"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-label">REASON</span>
                <span className="rounded border border-orange-500/30 px-2 py-[3px] text-[10px] font-semibold tracking-wide text-orange-300">
                  {report.reason || "Other"}
                </span>
              </div>
            </div>
          ))}

          {data.reports.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.10] bg-card/50 px-6 py-16 text-center">
              <p className="text-sm font-medium text-white">No reports found</p>
            </div>
          )}
        </div>

        {/* Members */}
        {content && content.members.length > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={15} className="text-[#3b82f6]" />
              <h2 className="text-sm font-semibold text-white">Members</h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-caption">
                {content.members.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {content.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                  <UserAvatar src={m.avatarUrl} name={m.fullName} size="sm" />
                  <span className="text-[12px] text-slate-200">{na(m.fullName)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation transcript */}
        <div className="rounded-xl border border-white/[0.08] bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle size={15} className="text-[#3b82f6]" />
            <h2 className="text-sm font-semibold text-white">Conversation</h2>
            {content && (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-caption">
                {content.messages.length}
              </span>
            )}
          </div>

          {contentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : !content || content.messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-caption">No messages in this conversation.</p>
          ) : (
            <div className="space-y-3">
              {content.messages.map((m, i) => <MessageBubble key={i} message={m} />)}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "delete" ? "Delete this conversation?" : "Dismiss these reports?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "delete"
                ? `This permanently deletes "${na(data.chat.name)}" and all its messages, and resolves all ${data.reports.length} report(s) against it. Members will be notified.`
                : `This keeps the conversation and marks all ${pendingCount} pending report(s) as resolved.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction === "delete" ? "destructive" : "default"}
              onClick={confirmAction}
            >
              {pendingAction === "delete" ? "Delete Conversation" : "Dismiss Reports"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MessageBubble({ message }: { message: ConversationMessage }) {
  const when = message.timestamp ? new Date(message.timestamp) : null;
  const time = when && !Number.isNaN(when.getTime())
    ? when.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

  return (
    <div className="flex gap-3">
      <UserAvatar src={message.sender.avatarUrl} name={message.sender.fullName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-semibold text-white">{na(message.sender.fullName)}</span>
          {time && <span className="text-[10px] text-caption">{time}</span>}
        </div>
        <div className="mt-1 w-fit max-w-full rounded-lg rounded-tl-sm border border-white/[0.06] bg-white/[0.03] px-3 py-2">
          <p className="whitespace-pre-wrap break-words text-[13px] text-slate-200">
            {message.text || <span className="italic text-caption">No text</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
