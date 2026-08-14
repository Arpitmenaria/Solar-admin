"use client";

import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useCourseEnrollments } from "@/hooks/use-courses";
import { formatDate, formatDateTime } from "@/lib/utils";

export function EnrollmentList({ courseId }: { courseId: string }) {
  const { data: enrollments, isLoading } = useCourseEnrollments(courseId);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {[0, 1, 2].map((i) => <TableRowSkeleton key={i} />)}
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return <div className="py-8 text-center text-[12.5px] text-slate-500">No students enrolled yet.</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-white/[0.06]">
      {enrollments.map((e) => (
        <div key={e.id} className="flex items-center gap-4 py-3.5">
          <UserAvatar src={e.studentAvatarUrl} name={e.studentName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{e.studentName}</p>
            <p className="text-[11.5px] text-slate-500">
              Enrolled {formatDate(e.enrolledAt)} · Last active {formatDateTime(e.lastActiveAt)}
            </p>
          </div>
          <div className="flex w-40 shrink-0 items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={`h-full rounded-full ${e.progressPct === 100 ? "bg-emerald-400" : "bg-blue-500"}`}
                style={{ width: `${e.progressPct}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-[11.5px] font-semibold text-slate-300">{e.progressPct}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
