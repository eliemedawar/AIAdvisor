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
  course_name?: string; // Present when serialized with course (e.g. dashboard)
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

/** Payloads for create/update (backend sets user where applicable) */
export type CreateCoursePayload = Pick<Course, "name" | "code" | "term"> & { credits?: number | null };
export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export type CreateAssignmentPayload = Pick<Assignment, "title" | "description" | "due_at" | "status" | "type"> & {
  course: number;
  weight?: number | null;
};
export type UpdateAssignmentPayload = Partial<Omit<CreateAssignmentPayload, "course">> & { course?: number };

export type CreateTaskPayload = Pick<Task, "title" | "description" | "status" | "priority"> & {
  assignment?: number | null;
  due_at?: string | null;
};
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type CreateEventPayload = Pick<CalendarEvent, "title" | "description" | "start_at" | "end_at" | "type"> & {
  course?: number | null;
  assignment?: number | null;
};
export type UpdateEventPayload = Partial<CreateEventPayload>;

export const plannerApi = {
  // Courses
  async listCourses(): Promise<Course[]> {
    const { data } = await httpClient.get<Course[]>("/planner/courses/");
    return data;
  },
  async createCourse(payload: CreateCoursePayload): Promise<Course> {
    const { data } = await httpClient.post<Course>("/planner/courses/", payload);
    return data;
  },
  async getCourse(id: number): Promise<Course> {
    const { data } = await httpClient.get<Course>(`/planner/courses/${id}/`);
    return data;
  },
  async updateCourse(id: number, payload: UpdateCoursePayload): Promise<Course> {
    const { data } = await httpClient.patch<Course>(`/planner/courses/${id}/`, payload);
    return data;
  },
  async deleteCourse(id: number): Promise<void> {
    await httpClient.delete(`/planner/courses/${id}/`);
  },

  // Assignments
  async listAssignments(params?: Record<string, unknown>): Promise<Assignment[]> {
    const { data } = await httpClient.get<Assignment[]>("/planner/assignments/", {
      params
    });
    return data;
  },
  async createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
    const { data } = await httpClient.post<Assignment>("/planner/assignments/", payload);
    return data;
  },
  async getAssignment(id: number): Promise<Assignment> {
    const { data } = await httpClient.get<Assignment>(`/planner/assignments/${id}/`);
    return data;
  },
  async updateAssignment(id: number, payload: UpdateAssignmentPayload): Promise<Assignment> {
    const { data } = await httpClient.patch<Assignment>(`/planner/assignments/${id}/`, payload);
    return data;
  },
  async deleteAssignment(id: number): Promise<void> {
    await httpClient.delete(`/planner/assignments/${id}/`);
  },

  // Tasks
  async listTasks(): Promise<Task[]> {
    const { data } = await httpClient.get<Task[]>("/planner/tasks/");
    return data;
  },
  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await httpClient.post<Task>("/planner/tasks/", payload);
    return data;
  },
  async getTask(id: number): Promise<Task> {
    const { data } = await httpClient.get<Task>(`/planner/tasks/${id}/`);
    return data;
  },
  async updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await httpClient.patch<Task>(`/planner/tasks/${id}/`, payload);
    return data;
  },
  async deleteTask(id: number): Promise<void> {
    await httpClient.delete(`/planner/tasks/${id}/`);
  },

  // Events
  async listEvents(): Promise<CalendarEvent[]> {
    const { data } = await httpClient.get<CalendarEvent[]>("/planner/events/");
    return data;
  },
  async createEvent(payload: CreateEventPayload): Promise<CalendarEvent> {
    const { data } = await httpClient.post<CalendarEvent>("/planner/events/", payload);
    return data;
  },
  async getEvent(id: number): Promise<CalendarEvent> {
    const { data } = await httpClient.get<CalendarEvent>(`/planner/events/${id}/`);
    return data;
  },
  async updateEvent(id: number, payload: UpdateEventPayload): Promise<CalendarEvent> {
    const { data } = await httpClient.patch<CalendarEvent>(`/planner/events/${id}/`, payload);
    return data;
  },
  async deleteEvent(id: number): Promise<void> {
    await httpClient.delete(`/planner/events/${id}/`);
  }
};


