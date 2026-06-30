"use client";

import { Users } from "lucide-react";
import { ReportsDirectory } from "@/components/reports/reports-directory";
import { useGroupReports, useGroupReportStats } from "@/hooks/use-reports";

export default function GroupReportsPage() {
  const { data: reports, isLoading: reportsLoading } = useGroupReports();
  const { data: stats, isLoading: statsLoading } = useGroupReportStats();

  return (
    <ReportsDirectory
      kind="group"
      basePath="/dashboard/group-reports"
      pageTitle="Group Reports"
      pageSubtitle="Review and action reports filed against groups."
      targetColumnLabel="Reported Group"
      targetIcon={Users}
      reports={reports}
      stats={stats}
      isLoading={reportsLoading || statsLoading}
    />
  );
}
