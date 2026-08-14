"use client";

import { useParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { ReportDetail } from "@/components/reports/report-detail";
import { useCourseReport } from "@/hooks/use-reports";

export default function CourseReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading } = useCourseReport(id);

  return (
    <ReportDetail
      kind="course"
      basePath="/dashboard/course-reports"
      targetLabel="Course"
      targetIcon={BookOpen}
      report={report}
      isLoading={isLoading}
    />
  );
}
