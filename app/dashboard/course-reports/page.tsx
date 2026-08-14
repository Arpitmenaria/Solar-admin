"use client";

import { BookOpen } from "lucide-react";
import { ReportsDirectory } from "@/components/reports/reports-directory";
import { useCourseReports, useCourseReportStats } from "@/hooks/use-reports";

export default function CourseReportsPage() {
  const { data: reports, isLoading: reportsLoading } = useCourseReports();
  const { data: stats, isLoading: statsLoading } = useCourseReportStats();

  return (
    <ReportsDirectory
      kind="course"
      basePath="/dashboard/course-reports"
      pageTitle="Course Reports"
      pageSubtitle="Review and action reports filed against courses."
      targetColumnLabel="Reported Course"
      targetIcon={BookOpen}
      reports={reports}
      stats={stats}
      isLoading={reportsLoading || statsLoading}
    />
  );
}
