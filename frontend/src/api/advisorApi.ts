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
    content: string
  ): Promise<Message[]> {
    const { data } = await httpClient.post<Message[]>(
      `/advisor/conversations/${conversationId}/messages/`,
      { content }
    );
    return data;
  },

  async clearConversation(conversationId: number): Promise<void> {
    await httpClient.delete(`/advisor/conversations/${conversationId}/messages/`);
  }
};


