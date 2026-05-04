import { httpClient } from "./httpClient";

export type CourseStatus = "completed" | "in_progress" | "planned";

export interface Course {
  id: number;
  user: number;
  name: string;
  code: string;
  term: string;
  credits: number | null;
  status: CourseStatus;
  category: string;
  major: string;
  requirement_type: string;
  original_placeholder: string;
}

export type AssignmentStatus = "pending" | "in_progress" | "done";

export interface Assignment {
  id: number;
  course: number;
  course_name?: string;
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
  location?: string;
}

// ── Curriculum types ────────────────────────────────────────────────────────

export interface CurriculaTerm {
  term_number: number;
  label: string;
  season: string;
  year: number;
  term_credits: number;
}

export interface CurriculaInfo {
  program: string;
  total_credits: number | null;
  terms: CurriculaTerm[];
}

export interface CurriculaResponse {
  available_majors: string[];
  curricula: Record<string, CurriculaInfo>;
}

/** A single option inside an elective list. */
export interface ElectiveOption {
  code: string;
  name: string;
  credits: number;
}

/** Response from GET /planner/courses/electives/ */
export interface ElectiveListsResponse {
  electives: Record<string, ElectiveOption[]>;
}

/** A course entry from the plan preview (not yet persisted). */
export interface PlannedCourse {
  code: string;
  name: string;
  credits: number;
  term_num: number;
  term_label: string;
  category: string;
  major: string;
  status: CourseStatus;
  is_placeholder: boolean;
  is_duplicate: boolean;
  /** Index within the term – used to key repeated placeholder codes. */
  slot: number;
  /** Requirement type key into ElectiveListsResponse.electives (empty for non-placeholders). */
  requirement_type: string;
  /** Filled in before apply-plan when user picks a real course for this slot. */
  original_placeholder?: string;
}

// ── CRUD payloads ───────────────────────────────────────────────────────────

export type CreateCoursePayload = Pick<Course, "name" | "code" | "term"> & {
  credits?: number | null;
  status?: CourseStatus;
  category?: string;
  major?: string;
};
export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export type CreateAssignmentPayload = Pick<
  Assignment,
  "title" | "description" | "due_at" | "status" | "type"
> & { course: number; weight?: number | null };
export type UpdateAssignmentPayload = Partial<Omit<CreateAssignmentPayload, "course">> & {
  course?: number;
};

export type CreateTaskPayload = Pick<Task, "title" | "description" | "status" | "priority"> & {
  assignment?: number | null;
  due_at?: string | null;
};
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type CreateEventPayload = Pick<
  CalendarEvent,
  "title" | "description" | "start_at" | "end_at" | "type"
> & { course?: number | null; assignment?: number | null };
export type UpdateEventPayload = Partial<CreateEventPayload>;

// ── API client ───────────────────────────────────────────────────────────────

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

  // Smart onboarding
  async getCurricula(): Promise<CurriculaResponse> {
    const { data } = await httpClient.get<CurriculaResponse>("/planner/courses/curricula/");
    return data;
  },
  async getElectives(): Promise<ElectiveListsResponse> {
    const { data } = await httpClient.get<ElectiveListsResponse>("/planner/courses/electives/");
    return data;
  },
  async generatePlan(
    major: string,
    currentTerm: number
  ): Promise<{ courses: PlannedCourse[]; major: string }> {
    const { data } = await httpClient.post("/planner/courses/generate-plan/", {
      major,
      current_term: currentTerm,
    });
    return data;
  },
  async applyPlan(
    courses: PlannedCourse[]
  ): Promise<{ created: Course[]; skipped: string[] }> {
    const { data } = await httpClient.post("/planner/courses/apply-plan/", { courses });
    return data;
  },

  // Assignments
  async listAssignments(params?: Record<string, unknown>): Promise<Assignment[]> {
    const { data } = await httpClient.get<Assignment[]>("/planner/assignments/", { params });
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
  },
};
