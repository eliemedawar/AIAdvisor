import { useEffect, useState } from "react";
import {
  Conversation,
  Message,
  advisorApi,
  type ApplyActionsResponse,
  type ProposedAction,
} from "../api/advisorApi";

interface UseAdvisorChatState {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  applyingActions: boolean;
  error: string | null;
  sendMessage: (content: string, attachedContext?: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
  clearConversation: () => Promise<void>;
  proposedActions: ProposedAction[];
  actionPlanConfidence?: number;
  applyProposedActions: () => Promise<ApplyActionsResponse | null>;
  clearProposedActions: () => void;
}

export const useAdvisorChat = (): UseAdvisorChatState => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [applyingActions, setApplyingActions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>([]);
  const [actionPlanConfidence, setActionPlanConfidence] = useState<number | undefined>(undefined);

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

  const sendMessage = async (content: string, attachedContext?: string) => {
    if (!conversation || !content.trim()) return;
    if (proposedActions.length > 0) return; // wait for user confirmation
    setSending(true);
    setError(null);
    try {
      const res = await advisorApi.sendMessage(conversation.id, content, attachedContext);
      setMessages((prev) => [...prev, ...res.messages]);
      setProposedActions(res.proposed_actions ?? []);
      setActionPlanConfidence(res.action_plan_confidence);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send message.");
      throw err;
    } finally {
      setSending(false);
    }
  };

  const retryLastMessage = async () => {
    // Find the last user message; remove it and the subsequent assistant message
    // from local state before retrying so we don't get duplicates.
    const reversed = [...messages].reverse();
    const lastUserIdx = reversed.findIndex((msg) => msg.role === "user");
    if (lastUserIdx === -1) return;
    const lastUserMessage = reversed[lastUserIdx];
    // Drop the last user message and any assistant messages that came after it
    setMessages((prev) => {
      const userMsgIdx = prev.findLastIndex((m) => m.id === lastUserMessage.id);
      return userMsgIdx === -1 ? prev : prev.slice(0, userMsgIdx);
    });
    await sendMessage(lastUserMessage.content);
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
      setProposedActions([]);
      setActionPlanConfidence(undefined);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to clear conversation.");
      throw err;
    }
  };

  const clearProposedActions = () => {
    setProposedActions([]);
    setActionPlanConfidence(undefined);
  };

  const applyProposedActions = async () => {
    if (!conversation) return null;
    if (!proposedActions.length) return null;
    setApplyingActions(true);
    setError(null);
    try {
      const res = await advisorApi.applyActions(conversation.id, proposedActions);
      setMessages(res.messages);
      setProposedActions([]);
      setActionPlanConfidence(undefined);
      return res;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to apply actions.");
      throw err;
    } finally {
      setApplyingActions(false);
    }
  };

  return {
    conversation,
    messages,
    loading,
    sending,
    applyingActions,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
    clearConversation,
    proposedActions,
    actionPlanConfidence,
    applyProposedActions,
    clearProposedActions,
  };
};


