"use client";

import { useParams } from "next/navigation";
import { Users } from "lucide-react";
import { ReportDetail } from "@/components/reports/report-detail";
import { useGroupReport } from "@/hooks/use-reports";

export default function GroupReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useGroupReport(id);

  return (
    <ReportDetail
      kind="group"
      basePath="/dashboard/group-reports"
      targetLabel="Group"
      targetIcon={Users}
      report={report}
      isLoading={isLoading}
    />
  );
}
