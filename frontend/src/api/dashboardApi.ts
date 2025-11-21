import { httpClient } from "./httpClient";
import type { Assignment, CalendarEvent, Task } from "./plannerApi";

export interface GpaTrendPoint {
  label: string;
  gpa: number;
}

export interface WeeklyTaskStat {
  day: string;
  completed: number;
  planned: number;
}

export interface StudyTimeByCourse {
  courseName: string;
  hours: number;
}

export interface DashboardOverview {
  current_gpa: number | null;
  upcoming_deadlines: Assignment[];
  weekly_tasks: Task[];
  study_time_this_week_hours: number;
  next_events: CalendarEvent[];
  gpa_trend: GpaTrendPoint[];
  weekly_task_stats: WeeklyTaskStat[];
  study_time_by_course: StudyTimeByCourse[];
}

export const dashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await httpClient.get<DashboardOverview>("/dashboard/overview/");
    return data;
  }
};


