import { ChangeEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GraduationCap, User as UserIcon, AlertCircle, RotateCw, PanelRightOpen, Send as SendIcon, X, ChevronLeft, ChevronRight, Trash2, Paperclip } from "lucide-react";
import {
  Heading,
  Text,
  Card,
  Button,
  Modal,
} from "../../components";
import { SkeletonChatMessage } from "../../components/core/Skeleton";
import { 
  AttachContextModal, 
  ContextSidebarContent,
  DateSeparator, 
  groupMessagesByDate
} from "../../components/chat";
import { useAdvisorChat } from "../../hooks/useAdvisorChat";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import type { EventPlan, ProposedAction } from "../../api/advisorApi";

// ─── Rich message content renderer ──────────────────────────────────────────

type MessageBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "nextstep"; text: string }
  | { kind: "header"; text: string }
  | { kind: "spacer" };

function parseMessageBlocks(content: string): MessageBlock[] {
  const blocks: MessageBlock[] = [];
  const lines = content.split("\n");
  let currentBullets: string[] | null = null;

  const flushBullets = () => {
    if (currentBullets && currentBullets.length > 0) {
      blocks.push({ kind: "bullets", items: [...currentBullets] });
      currentBullets = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    // Bullet lines: •, -, *, or numbered (1. 2. etc.)
    if (/^([•\-\*]|\d+\.)\s+/.test(trimmed)) {
      if (!currentBullets) currentBullets = [];
      currentBullets.push(trimmed.replace(/^([•\-\*]|\d+\.)\s+/, ""));
      continue;
    }
    flushBullets();
    if (trimmed === "") {
      if (blocks.length > 0 && blocks[blocks.length - 1].kind !== "spacer") {
        blocks.push({ kind: "spacer" });
      }
      continue;
    }
    if (/^next step[s]?:/i.test(trimmed)) {
      blocks.push({ kind: "nextstep", text: trimmed.replace(/^next step[s]?:\s*/i, "") });
      continue;
    }
    // Section header: short line ending with ":" and no full-stop mid-text
    if (trimmed.endsWith(":") && trimmed.length < 80 && !/[.!?]/.test(trimmed.slice(0, -1))) {
      blocks.push({ kind: "header", text: trimmed.slice(0, -1) });
      continue;
    }
    blocks.push({ kind: "paragraph", text: trimmed });
  }
  flushBullets();
  while (blocks.length > 0 && blocks[blocks.length - 1].kind === "spacer") {
    blocks.pop();
  }
  return blocks;
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function AssistantMessageContent({ content }: { content: string }) {
  const blocks = parseMessageBlocks(content);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === "paragraph") {
          return (
            <p key={i} className="text-sm leading-[1.72]">
              <InlineText text={block.text} />
            </p>
          );
        }
        if (block.kind === "bullets") {
          return (
            <ul key={i} className="space-y-1.5 pl-0.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm leading-[1.65]">
                  <span className="mt-[0.44em] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/70" />
                  <span className="flex-1">
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === "nextstep") {
          return (
            <div
              key={i}
              className="mt-2 flex items-start gap-2.5 rounded-xl border border-violet-500/25 bg-violet-500/[0.08] px-3.5 py-2.5"
            >
              <span className="mt-0.5 shrink-0 rounded-md bg-violet-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">
                Next
              </span>
              <p className="flex-1 text-sm leading-[1.65] text-slate-200">
                <InlineText text={block.text} />
              </p>
            </div>
          );
        }
        if (block.kind === "header") {
          return (
            <p key={i} className="pb-0.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:pt-0">
              {block.text}
            </p>
          );
        }
        // spacer
        return <div key={i} className="h-1" />;
      })}
    </div>
  );
}

// ─── Event plan header ────────────────────────────────────────────────────────

function EventPlanHeader({ plan }: { plan: EventPlan }) {
  if (!plan.course_code && !plan.event_datetime) return null;
  return (
    <div className="mb-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-3.5 py-2.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
        Detected event
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {plan.course_code && (
          <span className="font-bold text-slate-100">{plan.course_code}</span>
        )}
        {plan.event_type && (
          <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
            {plan.event_type}
          </span>
        )}
        {plan.availability_note && (
          <span className="text-xs text-slate-400">{plan.availability_note}</span>
        )}
      </div>
    </div>
  );
}

// ─── Action plan review component ────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/20 text-red-300",
  medium: "bg-amber-500/20 text-amber-300",
  low: "bg-slate-600/30 text-slate-400",
};

const ASSIGNMENT_TYPE_STYLES: Record<string, string> = {
  exam:     "bg-red-500/20 text-red-300",
  quiz:     "bg-orange-500/20 text-orange-300",
  project:  "bg-blue-500/20 text-blue-300",
  homework: "bg-sky-500/20 text-sky-300",
  other:    "bg-slate-600/30 text-slate-400",
};

const EVENT_TYPE_STYLES: Record<string, string> = {
  exam:          "bg-red-500/20 text-red-300",
  quiz:          "bg-orange-500/20 text-orange-300",
  deadline:      "bg-amber-500/20 text-amber-300",
  homework:      "bg-sky-500/20 text-sky-300",
  project:       "bg-blue-500/20 text-blue-300",
  study_session: "bg-emerald-500/20 text-emerald-300",
  class:         "bg-slate-500/20 text-slate-300",
  other:         "bg-slate-600/30 text-slate-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computePriority(dueAt: string): "high" | "medium" | "low" {
  const diffDays = (new Date(dueAt).getTime() - Date.now()) / 86_400_000;
  if (diffDays < 3) return "high";
  if (diffDays < 7) return "medium";
  return "low";
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
      {label} · {count}
    </p>
  );
}

function ActionPlanReview({
  actions,
  confidence,
}: {
  actions: ProposedAction[];
  confidence?: number;
}) {
  const sessions = actions.filter((a) => a.type === "create_calendar_event");
  const tasks = actions.filter((a) => a.type === "create_task");
  const assignments = actions.filter((a) => a.type === "create_assignment");
  const electives = actions.filter((a) => a.type === "select_elective");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          Review the items below. Nothing is added until you confirm.
        </p>
        {confidence !== undefined && (
          <span className="text-[10px] text-slate-500 tabular-nums">
            {(confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>

      {actions.length === 0 && (
        <p className="text-xs text-slate-400">No actions proposed.</p>
      )}

      {/* Calendar events (study sessions, deadlines, exams…) */}
      {sessions.length > 0 && (
        <div>
          <SectionHeader label="Calendar events" count={sessions.length} />
          <div className="space-y-2">
            {actions.map((a, idx) =>
              a.type !== "create_calendar_event" ? null : (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-3.5 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        EVENT_TYPE_STYLES[a.event_type] ?? EVENT_TYPE_STYLES.other
                      }`}
                    >
                      {a.event_type.replace("_", " ")}
                    </span>
                  </div>
                  {a.course_code && (
                    <p className="mt-0.5 text-[10px] text-slate-500">{a.course_code}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {fmtDate(a.start_at)} · {fmtTime(a.start_at)} – {fmtTime(a.end_at)}
                  </p>
                  {a.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{a.description}</p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div>
          <SectionHeader label="Tasks" count={tasks.length} />
          <div className="space-y-2">
            {actions.map((a, idx) =>
              a.type !== "create_task" ? null : (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/50 px-3.5 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.low
                      }`}
                    >
                      {a.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {a.course_code && `${a.course_code} · `}
                    {a.due_at ? `Due: ${fmtDate(a.due_at)}` : "No due date"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Assignments / Deadlines */}
      {assignments.length > 0 && (
        <div>
          <SectionHeader label="Assignments" count={assignments.length} />
          <div className="space-y-2">
            {actions.map((a, idx) =>
              a.type !== "create_assignment" ? null : (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/50 px-3.5 py-2.5"
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          ASSIGNMENT_TYPE_STYLES[a.assignment_type] ?? ASSIGNMENT_TYPE_STYLES.other
                        }`}
                      >
                        {a.assignment_type}
                      </span>
                      {(() => {
                        const p = computePriority(a.due_at);
                        return (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PRIORITY_STYLES[p]}`}
                          >
                            {p}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {a.course_code && `${a.course_code} · `}Due: {fmtDateTime(a.due_at)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Elective selections */}
      {electives.length > 0 && (
        <div>
          <SectionHeader label="Elective selections" count={electives.length} />
          <div className="space-y-2">
            {actions.map((a, idx) =>
              a.type !== "select_elective" ? null : (
                <div
                  key={idx}
                  className="rounded-xl border border-violet-600/40 bg-violet-500/10 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                      Elective
                    </span>
                    <p className="text-sm font-semibold text-slate-100">
                      {a.selected_course_code} — {a.selected_course_name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {a.credits} credits · Replaces slot ID#{a.placeholder_course_id}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export const ChatPage = () => {
  const {
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
    clearProposedActions
  } = useAdvisorChat();
  
  const [input, setInput] = useState("");
  const [attachedContext, setAttachedContext] = useState<string | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [isLiveContextOpen, setIsLiveContextOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem(LIVE_CONTEXT_VISIBILITY_KEY);
    return stored === null ? true : stored === "true";
  });
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isClearingConversation, setIsClearingConversation] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const viewport = useBreakpoint();
  const showInlineContext = viewport.isDesktop;

  // Scroll the sentinel element into view after every messages/sending change.
  // requestAnimationFrame defers until after the browser has painted the new
  // DOM so measurements and scrollIntoView are always accurate.
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "instant" : "smooth",
        block: "end",
      });
    });
  }, [messages, sending, prefersReducedMotion]);

  useEffect(() => {
    if (showInlineContext && isContextDrawerOpen) {
      setIsContextDrawerOpen(false);
    }
  }, [showInlineContext, isContextDrawerOpen]);

  useEffect(() => {
    if (!isContextDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsContextDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isContextDrawerOpen]);

  useEffect(() => {
    if (!isContextDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isContextDrawerOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LIVE_CONTEXT_VISIBILITY_KEY, String(isLiveContextOpen));
  }, [isLiveContextOpen]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    setInput("");
    const ctx = attachedContext ?? undefined;
    setAttachedContext(null);
    try {
      await sendMessage(content, ctx);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleAttachContext = (formattedContext: string) => {
    setAttachedContext(formattedContext);
  };

  const handleRetry = async () => {
    try {
      await retryLastMessage();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleOpenClearModal = () => setIsClearConfirmOpen(true);

  const handleCloseClearModal = () => {
    if (isClearingConversation) return;
    setIsClearConfirmOpen(false);
  };

  const handleConfirmClearConversation = async () => {
    if (!conversation) return;
    setIsClearingConversation(true);
    try {
      await clearConversation();
      setIsClearConfirmOpen(false);
    } catch (err) {
      // Error is surfaced via hook state
    } finally {
      setIsClearingConversation(false);
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  const formatMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasMessages = messages.length > 0;
  const canClearConversation =
    hasMessages && !loading && !sending && proposedActions.length === 0 && !applyingActions;
  const hasPendingActionPlan = proposedActions.length > 0;
  const canInteractWithComposer = !hasPendingActionPlan && !loading && !sending && !applyingActions;

  return (
    <>
      <div className="flex h-full w-full flex-1 min-h-0 overflow-hidden">
        {/* Center Chat Column */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          {showInlineContext && (
            <button
              type="button"
              onClick={() => setIsLiveContextOpen((prev) => !prev)}
              aria-pressed={isLiveContextOpen}
              aria-label={isLiveContextOpen ? "Collapse live context" : "Expand live context"}
              className="hidden lg:flex absolute right-0 top-1/2 z-20 h-16 w-10 -translate-y-1/2 items-center justify-center rounded-l-2xl border border-r-0 border-slate-900/70 bg-slate-950/90 text-slate-400 shadow-elevation-mid backdrop-blur-2xl transition-all duration-quick ease-snappy hover:bg-slate-900/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {isLiveContextOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="border-b border-slate-800/30 bg-slate-950/40 px-4 py-3 sm:px-6 sm:py-4 backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Heading level="h1" className="text-xl sm:text-2xl">
                  AI Academic Advisor
                </Heading>
                <Text variant="body" color="muted" className="mt-1 text-xs sm:text-sm">
                  Ask questions about courses, exams, and study strategies
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {hasMessages && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={handleOpenClearModal}
                    disabled={!canClearConversation || isClearingConversation}
                    aria-label="Clear conversation"
                    title="Clear chat"
                    className="rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    <span className="hidden sm:inline">Clear chat</span>
                    <span className="sr-only sm:hidden">Clear conversation</span>
                  </Button>
                )}
                {!showInlineContext && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PanelRightOpen className="h-4 w-4" />}
                    onClick={() => setIsContextDrawerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 text-xs text-slate-200 transition-all hover:bg-slate-900/80"
                  >
                    View context
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="scrollable min-h-0 flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 sm:px-6"
          >
            {loading && !hasMessages ? (
              <div className="space-y-4">
                <SkeletonChatMessage isUser={false} />
                <SkeletonChatMessage isUser={true} />
                <SkeletonChatMessage isUser={false} />
              </div>
            ) : hasMessages ? (
              <>
                <div className="flex-1 min-h-6" />
                <div className="space-y-1">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      <DateSeparator date={group.date} />
                      <AnimatePresence mode="popLayout">
                        {group.messages.map((message, index) => {
                          const isUser = message.role === "user";
                          const messageTime = formatMessageTime(message.created_at);
                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{
                                opacity: 0,
                                y: prefersReducedMotion ? 0 : -10,
                                scale: prefersReducedMotion ? 1 : 0.98,
                              }}
                              transition={{ duration: 0.18, delay: index * 0.02, ease: [0.4, 0.1, 0.2, 1] }}
                              className={`group mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`flex w-full max-w-2xl items-end gap-3 sm:gap-4 ${
                                  isUser ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-quick ease-snappy ${
                                    isUser
                                      ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-elevation-mid"
                                      : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-elevation-mid"
                                  }`}
                                >
                                  {isUser ? (
                                    <UserIcon className="h-4 w-4" />
                                  ) : (
                                    <GraduationCap className="h-4 w-4" />
                                  )}
                                </div>

                                <div
                                  className={`w-full rounded-2xl shadow-elevation-low transition-all duration-base ease-smooth ${
                                    isUser
                                      ? "max-w-lg px-4 py-3 bg-gradient-to-br from-primary-600 to-primary-500 text-slate-50 shadow-elevation-mid ring-1 ring-primary-500/20"
                                      : "max-w-[36rem] px-5 py-4 border border-slate-800/60 bg-surface-elevated text-slate-100 ring-1 ring-slate-900/40"
                                  }`}
                                >
                                  {isUser ? (
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                                  ) : message.isLoading ? (
                                    <div
                                      className="flex items-center gap-1.5 py-0.5"
                                      role="status"
                                      aria-label="Advisor is thinking"
                                    >
                                      <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-400" />
                                      <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-500 [animation-delay:0.2s]" />
                                      <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-400 [animation-delay:0.4s]" />
                                    </div>
                                  ) : (
                                    <AssistantMessageContent content={message.content} />
                                  )}
                                  {!message.isLoading && (
                                    <div className={`mt-2.5 flex items-center text-[10px] leading-tight ${isUser ? "justify-end text-slate-200/70" : "justify-end text-slate-500"}`}>
                                      <span>{messageTime}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Typing indicator is now rendered inline as an optimistic assistant message bubble */}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    role="alert"
                    aria-live="assertive"
                  >
                    <Card variant="default" padding="md" className="border-error-500/50 bg-error-500/10">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 text-error-500" aria-hidden="true" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-error-400">Failed to send message</p>
                          <p className="mt-1 text-xs text-slate-400">{error}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-error-400 transition-all duration-quick ease-snappy hover:bg-error-500/20"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                          <button
                            onClick={clearError}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-quick ease-snappy hover:bg-surface-elevated"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
            ) : (
              <EmptyChatState onSelectPrompt={handleQuickAction} />
            )}
            {/* Scroll sentinel – always rendered so scrollIntoView works in every state */}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <ChatInputArea
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onPromptSelect={handleQuickAction}
            onOpenAttach={() => setIsAttachModalOpen(true)}
            placeholder={
              conversation ? "Ask about your schedule, exams, or study strategy…" : "Preparing your conversation…"
            }
            disabled={!canInteractWithComposer}
            sending={sending || applyingActions}
            showSuggestedPrompts={hasMessages}
            attachedContext={attachedContext}
            onClearAttachedContext={() => setAttachedContext(null)}
          />
        </div>

        {/* Context Sidebar - inline on lg+ */}
        {showInlineContext && isLiveContextOpen && (
          <aside className="hidden h-full min-h-0 w-[360px] flex-shrink-0 flex-col border-l border-slate-800/70 bg-slate-950/70 text-slate-100 backdrop-blur-sm lg:flex xl:w-[400px]">
            <div className="border-b border-slate-900/60 px-6 pt-6 pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Live context
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-tight text-white">
                Your academic overview
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <ContextSidebarContent />
            </div>
          </aside>
        )}
      </div>

    {/* Mobile Context Drawer */}
    <AnimatePresence>
      {isContextDrawerOpen && !showInlineContext && (
        <div className="fixed inset-0 z-40 flex justify-end lg:hidden" role="dialog" aria-modal="true" aria-label="Study context drawer">
          <motion.button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsContextDrawerOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="relative z-50 ml-auto h-full w-80 max-w-full"
          >
            <div className="flex h-full flex-col border-l border-slate-900/60 bg-slate-950/95 text-slate-100 shadow-[0_0_60px_rgba(2,6,23,0.95)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-slate-900/60 px-5 py-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Live context
                  </p>
                  <h3 className="text-base font-semibold text-slate-100">
                    Your academic overview
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContextDrawerOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800/60 text-slate-400 transition-all hover:text-slate-100"
                  aria-label="Close context drawer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="scrollable flex-1 overflow-y-auto px-5 py-4">
                <ContextSidebarContent />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <Modal
        isOpen={isClearConfirmOpen}
        onClose={handleCloseClearModal}
        title="Clear conversation"
        size="sm"
        disableBackdropClose={isClearingConversation}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseClearModal}
              disabled={isClearingConversation}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmClearConversation}
              loading={isClearingConversation}
            >
              Delete messages
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Clear this conversation? This will delete all messages.
        </p>
      </Modal>

      {/* AI proposed actions confirmation */}
      <Modal
        isOpen={hasPendingActionPlan}
        onClose={clearProposedActions}
        title="AI suggests these changes"
        size="md"
        disableBackdropClose={applyingActions}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearProposedActions}
              disabled={applyingActions}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={async () => {
                try {
                  await applyProposedActions();
                } catch {
                  // Error is shown via hook state
                }
              }}
              loading={applyingActions}
              disabled={applyingActions}
            >
              Confirm & add
            </Button>
          </>
        }
      >
        {eventPlan && <EventPlanHeader plan={eventPlan} />}
        <ActionPlanReview
          actions={proposedActions}
          confidence={actionPlanConfidence}
        />
      </Modal>

      {/* Attach Context Modal */}
      <AttachContextModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onAttach={(formattedContext) => handleAttachContext(formattedContext)}
      />
    </>
  );
};

interface ChatInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onPromptSelect: (prompt: string) => void;
  onOpenAttach: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
  showSuggestedPrompts?: boolean;
  attachedContext?: string | null;
  onClearAttachedContext?: () => void;
}

const PROMPT_PRESETS = [
  "Make me a study plan",
  "Plan my week",
  "What do I still need?",
  "Am I on track for CCE?",
];
const MAX_TEXTAREA_HEIGHT = 128;
const LIVE_CONTEXT_VISIBILITY_KEY = "ai-advisor-live-context-visible";

const ChatInputArea = ({
  value,
  onChange,
  onSubmit,
  onPromptSelect,
  onOpenAttach,
  placeholder,
  disabled = false,
  sending = false,
  showSuggestedPrompts = true,
  attachedContext,
  onClearAttachedContext,
}: ChatInputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isBusy = disabled || sending;
  const isSubmitDisabled = isBusy || !value.trim();

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(event);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSubmitDisabled) {
        onSubmit();
      }
    }
  };

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="shrink-0 px-4 pt-3 sm:px-6 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent backdrop-blur-sm" style={{ paddingBottom: 'max(1.25rem, calc(1.25rem + env(safe-area-inset-bottom)))' }}>
      <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto w-full space-y-4">
        {showSuggestedPrompts && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <span className="uppercase tracking-[0.16em] text-slate-400">Suggested prompts</span>
            <span className="text-slate-500">· Tap to autofill</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {PROMPT_PRESETS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-100 transition hover:border-slate-400 hover:bg-slate-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attached context chip */}
        {attachedContext && (
          <div className="flex items-center gap-2 rounded-xl border border-primary-700/40 bg-primary-950/40 px-3 py-1.5 text-xs text-primary-300">
            <Paperclip className="h-3.5 w-3.5 flex-shrink-0 text-primary-400" />
            <span className="flex-1 truncate">Context attached</span>
            <button
              type="button"
              onClick={onClearAttachedContext}
              className="rounded p-0.5 hover:text-primary-100 transition-colors"
              aria-label="Remove attached context"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.65)] transition-[border-color,box-shadow] duration-150 focus-within:border-violet-500/60 focus-within:shadow-[0_18px_60px_rgba(0,0,0,0.65),0_0_0_2px_rgba(139,92,246,0.25)]">
          {/* Paperclip / attach context button */}
          <button
            type="button"
            onClick={onOpenAttach}
            disabled={isBusy}
            title="Attach context from planner"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:text-slate-200 disabled:opacity-40"
            aria-label="Attach planner context"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            className="flex-1 resize-none bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 text-sm leading-6 text-slate-50 placeholder:text-slate-500 max-h-32 overflow-y-auto py-1 disabled:opacity-60"
            placeholder={placeholder}
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="pl-1 text-[11px] text-slate-500">Shift + Enter for newline · Enter to send</p>
      </form>
    </div>
  );
};

interface EmptyChatStateProps {
  onSelectPrompt: (prompt: string) => void;
}

function EmptyChatState({ onSelectPrompt }: EmptyChatStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-[460px] rounded-3xl border border-slate-800/80 bg-slate-950/80 px-10 py-9 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Start your conversation</h2>
            <p className="text-sm text-slate-400">
              Ask about upcoming exams, study plans, course choices, or how to prioritize your workload.
            </p>
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 mb-3">Quick starters</p>

        <div className="flex flex-wrap gap-2">
          {[
            "Make me a study plan",
            "Plan my week around my deadlines",
            "Help me study for my exams",
            "What courses did I already complete?",
            "Which electives can I choose?",
            "Am I on track for CCE?",
          ].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSelectPrompt(p)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs text-slate-100 hover:border-slate-400 hover:bg-slate-900 transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
