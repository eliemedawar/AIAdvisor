import { httpClient } from "./httpClient";

export interface Conversation {
  id: number;
  user: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  /** Numeric ID from the server, or a temporary string ID for optimistic messages. */
  id: number | string;
  conversation: number;
  role: MessageRole;
  content: string;
  created_at: string;
  /** Set to `true` on locally-generated messages that haven't been confirmed by the server yet. */
  optimistic?: true;
  /** Set to `true` on the temporary assistant placeholder shown while the API is in flight. */
  isLoading?: true;
}

export type AssignmentType = "homework" | "project" | "exam" | "quiz" | "other";
export type AssignmentStatus = "pending" | "in_progress" | "done";
export type EventType = "exam" | "class" | "study_session" | "deadline" | "quiz" | "homework" | "project" | "other";
export type TaskPriority = "low" | "medium" | "high";

export type ProposedAction =
  | {
      type: "create_assignment";
      course_code: string;
      title: string;
      description: string | null;
      due_at: string;
      assignment_type: AssignmentType;
      weight: number | null;
      status: AssignmentStatus;
    }
  | {
      type: "create_calendar_event";
      title: string;
      description: string | null;
      start_at: string;
      end_at: string;
      event_type: EventType;
      course_code: string | null;
    }
  | {
      type: "create_task";
      title: string;
      description: string | null;
      due_at: string | null;
      priority: TaskPriority;
      status: AssignmentStatus;
      course_code: string | null;
    }
  | {
      type: "select_elective";
      placeholder_course_id: number;
      selected_course_code: string;
      selected_course_name: string;
      credits: number;
    };

export interface EventPlanStudySession {
  title: string;
  start_at: string;
  end_at: string;
  description: string | null;
}

export interface EventPlanTask {
  title: string;
  due_at: string | null;
  priority: TaskPriority;
}

export interface EventPlan {
  course_code: string | null;
  event_type: string | null;
  event_datetime: string | null;
  availability_note: string | null;
  study_sessions: EventPlanStudySession[];
  tasks: EventPlanTask[];
}

export interface SendMessageResponse {
  messages: Message[];
  proposed_actions: ProposedAction[];
  action_plan_confidence?: number;
  event_plan?: EventPlan | null;
}

export interface ApplyActionsResponse {
  messages: Message[];
  created: {
    assignment_ids: number[];
    event_ids: number[];
    task_ids: number[];
    elective_ids: number[];
  };
}

export const advisorApi = {
  async listConversations(): Promise<Conversation[]> {
    const { data } = await httpClient.get<Conversation[]>("/advisor/conversations/");
    return data;
  },

  async createConversation(title?: string): Promise<Conversation> {
    const payload = title ? { title } : {};
    const { data } = await httpClient.post<Conversation>(
      "/advisor/conversations/",
      payload
    );
    return data;
  },

  async listMessages(conversationId: number): Promise<Message[]> {
    const { data } = await httpClient.get<Message[]>(
      `/advisor/conversations/${conversationId}/messages/`
    );
    return data;
  },

  async sendMessage(
    conversationId: number,
    content: string,
    attachedContext?: string,
  ): Promise<SendMessageResponse> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data } = await httpClient.post<SendMessageResponse>(
      `/advisor/conversations/${conversationId}/messages/`,
      {
        content,
        timezone,
        ...(attachedContext ? { attached_context: attachedContext } : {}),
      }
    );
    return data;
  },

  async applyActions(conversationId: number, actions: ProposedAction[]): Promise<ApplyActionsResponse> {
    const { data } = await httpClient.post<ApplyActionsResponse>(
      `/advisor/conversations/${conversationId}/apply-actions/`,
      { actions }
    );
    return data;
  },

  async clearConversation(conversationId: number): Promise<void> {
    await httpClient.delete(`/advisor/conversations/${conversationId}/messages/`);
  }
};


