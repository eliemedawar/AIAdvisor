import { useEffect, useState } from "react";
import {
  Conversation,
  Message,
  advisorApi
} from "../api/advisorApi";

interface UseAdvisorChatState {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
  clearConversation: () => Promise<void>;
}

export const useAdvisorChat = (): UseAdvisorChatState => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const conversations = await advisorApi.listConversations();
        let active = conversations[0] ?? null;

        if (!active) {
          active = await advisorApi.createConversation("My Study Plan");
        }

        setConversation(active);
        const msgs = await advisorApi.listMessages(active.id);
        setMessages(msgs);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load chat.");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  const sendMessage = async (content: string) => {
    if (!conversation || !content.trim()) return;
    setSending(true);
    setError(null);
    try {
      const newMessages = await advisorApi.sendMessage(conversation.id, content);
      setMessages((prev) => [...prev, ...newMessages]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send message.");
      throw err;
    } finally {
      setSending(false);
    }
  };

  const retryLastMessage = async () => {
    // Find the last user message and retry it
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearConversation = async () => {
    if (!conversation) {
      return;
    }
    setError(null);
    try {
      await advisorApi.clearConversation(conversation.id);
      setMessages([]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to clear conversation.");
      throw err;
    }
  };

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
    clearConversation
  };
};


