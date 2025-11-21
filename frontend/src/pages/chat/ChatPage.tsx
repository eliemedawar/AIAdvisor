import { ChangeEvent, FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bot, User as UserIcon, AlertCircle, RotateCw, PanelRightOpen, Send as SendIcon, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  Heading,
  Text,
  Card,
  Button,
  EmptyState,
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

export const ChatPage = () => {
  const { 
    conversation, 
    messages, 
    loading, 
    sending, 
    error, 
    sendMessage,
    retryLastMessage,
    clearError,
    clearConversation
  } = useAdvisorChat();
  
  const [input, setInput] = useState("");
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
  const prefersReducedMotion = useReducedMotion();
  const viewport = useBreakpoint();
  const showInlineContext = viewport.isDesktop;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

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
    try {
      await sendMessage(content);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleAttachContext = (context: any) => {
    console.log("Context attached:", context);
    // In production, this would be sent with the next message
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

  const canClearConversation = messages.length > 0 && !loading && !sending;

  return (
    <>
      <div className="flex h-full w-full flex-1 min-h-0 overflow-hidden">
        {/* Center Chat Column */}
        <div className="relative flex min-w-0 flex-1 flex-col min-h-0">
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
          {/* Header */}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={handleOpenClearModal}
                disabled={!canClearConversation || isClearingConversation}
                aria-label="Clear conversation"
                title="Clear chat"
                className="text-xs text-slate-200"
              >
                <span className="hidden sm:inline">Clear chat</span>
                <span className="sr-only sm:hidden">Clear conversation</span>
              </Button>
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

          {/* Chat Column Content */}
          <div className="relative flex min-w-0 flex-1 flex-col min-h-0">
            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="scrollable flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4"
            >
              <div className="space-y-4 pb-32">
                {loading && !messages.length ? (
                  <div className="space-y-4">
                    <SkeletonChatMessage isUser={false} />
                    <SkeletonChatMessage isUser={true} />
                    <SkeletonChatMessage isUser={false} />
                  </div>
                ) : !messages.length ? (
                  <div className="flex h-full items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full max-w-md"
                    >
                      <EmptyState
                        icon={<Bot />}
                        title="Start your conversation"
                        description="Ask about upcoming exams, study plans, course recommendations, or how to prioritize your workload."
                        action={
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleQuickAction("Can you help me plan my week?")}
                          >
                            Try a prompt
                          </Button>
                        }
                        className="rounded-2xl border border-dashed border-slate-900/60 bg-slate-950/20"
                      />
                    </motion.div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
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
                                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10, scale: prefersReducedMotion ? 1 : 0.98 }}
                                  transition={{ duration: 0.18, delay: index * 0.02, ease: [0.4, 0.1, 0.2, 1] }}
                                  className={`group mb-5 flex ${
                                    isUser ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`flex w-full max-w-2xl items-end gap-3 sm:gap-4 ${
                                      isUser ? "flex-row-reverse" : "flex-row"
                                    }`}
                                  >
                                    {/* Avatar */}
                                    <div
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-quick ease-snappy ${
                                        isUser
                                          ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-elevation-mid"
                                          : "border border-slate-800/70 bg-surface-elevated text-slate-200 shadow-elevation-low"
                                      }`}
                                    >
                                      {isUser ? (
                                        <UserIcon className="h-4 w-4" />
                                      ) : (
                                        <Bot className="h-4 w-4" />
                                      )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                      className={`w-full max-w-xl rounded-2xl px-4 py-3 shadow-elevation-low transition-all duration-base ease-smooth ${
                                        isUser
                                          ? "bg-gradient-to-br from-primary-600 to-primary-500 text-slate-50 shadow-elevation-mid ring-1 ring-primary-500/20"
                                          : "border border-slate-800/70 bg-surface-elevated text-slate-100 shadow-elevation-low ring-1 ring-slate-900/40"
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.content}
                                      </p>
                                      <div
                                        className={`mt-2 flex items-center gap-2 text-[11px] leading-tight ${
                                          isUser ? "justify-end text-slate-200" : "justify-between text-slate-400"
                                        }`}
                                      >
                                        {!isUser && <span className="font-medium text-slate-300">Advisor</span>}
                                        {isUser && <span className="font-medium">You</span>}
                                        <span className="opacity-90">{messageTime}</span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    {/* Typing Indicator */}
                    {sending && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12, ease: [0.25, 1, 0.5, 1] }}
                        className="flex justify-start"
                        role="status"
                        aria-live="polite"
                        aria-label="AI is typing"
                      >
                        <div className="flex items-end gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800/70 bg-surface-elevated shadow-elevation-low">
                            <Bot className="h-4 w-4 text-slate-200" />
                          </div>
                          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800/70 bg-surface-elevated shadow-elevation-low ring-1 ring-slate-900/40 px-4 py-3">
                            <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-400" />
                            <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-500 [animation-delay:0.2s]" />
                            <span className="inline-flex h-2 w-2 animate-pulse-dots rounded-full bg-slate-400 [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error State */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                        role="alert"
                        aria-live="assertive"
                      >
                        <Card
                          variant="default"
                          padding="md"
                          className="border-error-500/50 bg-error-500/10"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 text-error-500" aria-hidden="true" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-error-400">
                                Failed to send message
                              </p>
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
                )}
              </div>
            </div>
            <ChatInputArea
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onPromptSelect={handleQuickAction}
              placeholder={
                conversation
                  ? "Ask about your schedule, exams, or study strategy…"
                  : "Preparing your conversation…"
              }
              disabled={loading}
              sending={sending}
            />
          </div>
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
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Study context drawer">
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
            className="relative z-50 h-full w-80 max-w-full"
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

      {/* Attach Context Modal */}
      <AttachContextModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onAttach={handleAttachContext}
      />
    </>
  );
};

interface ChatInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onPromptSelect: (prompt: string) => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
}

const PROMPT_PRESETS = ["Plan week", "Today focus", "Exam prep", "Explain concept"];
const MAX_TEXTAREA_HEIGHT = 128;
const LIVE_CONTEXT_VISIBILITY_KEY = "ai-advisor-live-context-visible";

const ChatInputArea = ({
  value,
  onChange,
  onSubmit,
  onPromptSelect,
  placeholder,
  disabled = false,
  sending = false,
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
    <div className="sticky bottom-0 left-0 right-0 px-6 pb-5 pt-3 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent backdrop-blur-sm">
      <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto w-full space-y-2">
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

        <div className="flex items-end gap-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 px-4 py-3 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-slate-50 placeholder:text-slate-500 max-h-32 overflow-y-auto disabled:opacity-60"
            placeholder={placeholder}
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
