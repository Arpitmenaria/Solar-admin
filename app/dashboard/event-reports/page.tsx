"use client";

import { CalendarDays } from "lucide-react";
import { ReportsDirectory } from "@/components/reports/reports-directory";
import { useEventReports, useEventReportStats } from "@/hooks/use-reports";

export default function EventReportsPage() {
  const { data: reports, isLoading: reportsLoading } = useEventReports();
  const { data: stats, isLoading: statsLoading } = useEventReportStats();

  return (
    <ReportsDirectory
      kind="event"
      basePath="/dashboard/event-reports"
      pageTitle="Event Reports"
      pageSubtitle="Review and action reports filed against events."
      targetColumnLabel="Reported Event"
      targetIcon={CalendarDays}
      reports={reports}
      stats={stats}
      isLoading={reportsLoading || statsLoading}
    />
  );
}
