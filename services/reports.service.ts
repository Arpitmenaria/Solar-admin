import type { Report, ReportStats, ReportStatus } from "@/types";
import {
  MOCK_GROUP_REPORTS,
  MOCK_GROUP_REPORT_STATS,
  MOCK_EVENT_REPORTS,
  MOCK_EVENT_REPORT_STATS,
} from "@/constants/mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function updateStatus(reports: Report[], id: string, status: ReportStatus): Report {
  const report = reports.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  report.status = status;
  return { ...report };
}

export const reportsService = {
  async getGroupReports(): Promise<Report[]> {
    await delay(250);
    return MOCK_GROUP_REPORTS.map((r) => ({ ...r }));
  },
  async getGroupReportStats(): Promise<ReportStats> {
    await delay(150);
    return MOCK_GROUP_REPORT_STATS;
  },
  async getGroupReportById(id: string): Promise<Report | null> {
    await delay(200);
    const report = MOCK_GROUP_REPORTS.find((r) => r.id === id);
    return report ? { ...report } : null;
  },
  async updateGroupReportStatus(id: string, status: ReportStatus): Promise<Report> {
    await delay(400);
    return updateStatus(MOCK_GROUP_REPORTS, id, status);
  },

  async getEventReports(): Promise<Report[]> {
    await delay(250);
    return MOCK_EVENT_REPORTS.map((r) => ({ ...r }));
  },
  async getEventReportStats(): Promise<ReportStats> {
    await delay(150);
    return MOCK_EVENT_REPORT_STATS;
  },
  async getEventReportById(id: string): Promise<Report | null> {
    await delay(200);
    const report = MOCK_EVENT_REPORTS.find((r) => r.id === id);
    return report ? { ...report } : null;
  },
  async updateEventReportStatus(id: string, status: ReportStatus): Promise<Report> {
    await delay(400);
    return updateStatus(MOCK_EVENT_REPORTS, id, status);
  },
};
