"use client";

import { useParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ReportDetail } from "@/components/reports/report-detail";
import { useEventReport } from "@/hooks/use-reports";

export default function EventReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useEventReport(id);

  return (
    <ReportDetail
      kind="event"
      basePath="/dashboard/event-reports"
      listLabel="Event Reports"
      targetLabel="Event"
      targetIcon={CalendarDays}
      report={report}
      isLoading={isLoading}
    />
  );
}
