import type { EducationActivity, EducationActivityAction, EducationEntityType } from "@/constants/education-mock-data";
import { MOCK_EDUCATION_ACTIVITY } from "@/constants/education-mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function formatNow(): string {
  const d = new Date();
  const date = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  const time = d.toTimeString().slice(0, 8);
  return `${date} ${time}`;
}

/** Called by courses.service.ts / library.service.ts on every create/update/publish/archive/delete. */
export function logEducationActivity(entry: {
  adminName: string;
  action: EducationActivityAction;
  entityType: EducationEntityType;
  entityName: string;
}): void {
  const activity: EducationActivity = {
    id: `ea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ...entry,
    timestamp: formatNow(),
  };
  MOCK_EDUCATION_ACTIVITY.unshift(activity);
}

export const educationActivityService = {
  async getEducationActivity(): Promise<EducationActivity[]> {
    await delay(200);
    return [...MOCK_EDUCATION_ACTIVITY];
  },
};
