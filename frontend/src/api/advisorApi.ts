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
  id: number;
  conversation: number;
  role: MessageRole;
  content: string;
  created_at: string;
}

export type AssignmentType = "homework" | "project" | "exam" | "quiz" | "other";
export type AssignmentStatus = "pending" | "in_progress" | "done";
export type EventType = "exam" | "class" | "study_session" | "other";
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
    };

export interface SendMessageResponse {
  messages: Message[];
  proposed_actions: ProposedAction[];
  action_plan_confidence?: number;
}

export interface ApplyActionsResponse {
  messages: Message[];
  created: {
    assignment_ids: number[];
    event_ids: number[];
    task_ids: number[];
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


