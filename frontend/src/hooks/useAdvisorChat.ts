import { useEffect, useState } from "react";
import {
  Conversation,
  Message,
  advisorApi,
  type ApplyActionsResponse,
  type EventPlan,
  type ProposedAction,
} from "../api/advisorApi";

// ── Client-side action course-code validator ──────────────────────────────
// Defense-in-depth: if the backend still returns stale course codes, fix them
// before showing the confirmation modal.

const _COURSE_RE = /\b([A-Z]{2,5})\s*(\d{3,4})\b/i;

function extractCourseFromMessage(message: string): string | null {
  const m = message.match(_COURSE_RE);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : null;
}

function fixActionsCourseCode(
  actions: ProposedAction[],
  sentMessage: string,
  eventPlan?: EventPlan | null,
): ProposedAction[] {
  // Prefer the deterministic course_code from the EventPlan; fall back to regex.
  const correct = eventPlan?.course_code ?? extractCourseFromMessage(sentMessage);
  if (!correct) return actions;
  const correctKey = correct.toUpperCase().replace(/\s+/g, "");

  return actions.map((action): ProposedAction => {
    if (action.type === "select_elective") return action;

    const existing = action.course_code ?? "";
    if (!existing) return action;
    if (existing.toUpperCase().replace(/\s+/g, "") === correctKey) return action;

    // Replace wrong course code in the title too
    const escaped = existing.replace(/([.*+?^${}()|[\]\\])/g, "\\$1").replace(/\s+/g, "\\s*");
    const wrongPattern = new RegExp(escaped, "gi");
    const fixedTitle = action.title.replace(wrongPattern, correct);

    switch (action.type) {
      case "create_assignment":
        return { ...action, course_code: correct, title: fixedTitle };
      case "create_calendar_event":
        return { ...action, course_code: correct, title: fixedTitle };
      case "create_task":
        return { ...action, course_code: correct, title: fixedTitle };
    }
  });
}

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
  eventPlan: EventPlan | null;
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
  const [eventPlan, setEventPlan] = useState<EventPlan | null>(null);

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

    // Unique string IDs for the two optimistic bubbles
    const ts = Date.now();
    const optimisticUserId = `opt-user-${ts}`;
    const optimisticAssistantId = `opt-asst-${ts}`;
    const now = new Date().toISOString();

    // ── Optimistic update: show user message + loading assistant immediately ──
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticUserId,
        conversation: conversation.id,
        role: "user",
        content,
        created_at: now,
        optimistic: true,
      } as const,
      {
        id: optimisticAssistantId,
        conversation: conversation.id,
        role: "assistant",
        content: "",
        created_at: now,
        optimistic: true,
        isLoading: true,
      } as const,
    ]);

    // Clear any previously proposed actions before issuing the new request.
    setProposedActions([]);
    setActionPlanConfidence(undefined);
    setEventPlan(null);
    setSending(true);
    setError(null);

    try {
      const res = await advisorApi.sendMessage(conversation.id, content, attachedContext);
      // Replace both optimistic messages with the confirmed server messages
      setMessages((prev) => [
        ...prev.filter(
          (m) => m.id !== optimisticUserId && m.id !== optimisticAssistantId
        ),
        ...res.messages,
      ]);
      const incomingPlan = res.event_plan ?? null;
      setEventPlan(incomingPlan);
      // Validate course codes using the deterministic EventPlan first, then regex fallback
      const validatedActions = fixActionsCourseCode(res.proposed_actions ?? [], content, incomingPlan);
      setProposedActions(validatedActions);
      setActionPlanConfidence(res.action_plan_confidence);
    } catch (err: any) {
      // Keep the optimistic user message (so the user can see what they sent)
      // but remove the loading assistant bubble and surface the error
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticAssistantId)
      );
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
      setEventPlan(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to clear conversation.");
      throw err;
    }
  };

  const clearProposedActions = () => {
    setProposedActions([]);
    setActionPlanConfidence(undefined);
    setEventPlan(null);
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
    eventPlan,
    applyProposedActions,
    clearProposedActions,
  };
};


