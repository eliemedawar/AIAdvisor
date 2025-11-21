import { httpClient } from "./httpClient";

export interface Course {
  id: number;
  user: number;
  name: string;
  code: string;
  term: string;
  credits: number | null;
}

export type AssignmentStatus = "pending" | "in_progress" | "done";

export interface Assignment {
  id: number;
  course: number;
  title: string;
  description: string;
  due_at: string;
  status: AssignmentStatus;
  weight: number | null;
  type: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  user: number;
  assignment: number | null;
  title: string;
  description: string;
  due_at: string | null;
  status: AssignmentStatus;
  priority: TaskPriority;
}

export interface CalendarEvent {
  id: number;
  user: number;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  type: string;
  course: number | null;
  assignment: number | null;
  location?: string; // Optional location field for future backend support
}

export const plannerApi = {
  async listCourses(): Promise<Course[]> {
    const { data } = await httpClient.get<Course[]>("/planner/courses/");
    return data;
  },

  async listAssignments(params?: Record<string, unknown>): Promise<Assignment[]> {
    const { data } = await httpClient.get<Assignment[]>("/planner/assignments/", {
      params
    });
    return data;
  },

  async listTasks(): Promise<Task[]> {
    const { data } = await httpClient.get<Task[]>("/planner/tasks/");
    return data;
  },

  async listEvents(): Promise<CalendarEvent[]> {
    const { data } = await httpClient.get<CalendarEvent[]>("/planner/events/");
    return data;
  }
};


