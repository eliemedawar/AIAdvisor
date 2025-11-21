import { ChangeEvent, FormEvent, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Paperclip, Send } from "lucide-react";
import clsx from "clsx";

import { ChatInput } from "../core/ChatInput";
import { QuickActions } from "./QuickActions";

interface ChatComposerProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
  onChange: (value: string) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onAttach: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatComposer = ({
  value,
  placeholder,
  disabled = false,
  sending = false,
  onChange,
  onSubmit,
  onAttach,
  onSelectPrompt,
}: ChatComposerProps) => {
  const isBusy = disabled || sending;
  const isSubmitDisabled = isBusy || !value.trim();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const hasValue = Boolean(value.trim());
  const isDockActive = isInputFocused || hasValue;
  const dockShadow = isDockActive
    ? "0 30px 80px rgba(3,7,18,0.65)"
    : "0 18px 55px rgba(2,6,23,0.45)";

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(event);
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <motion.section
      layout
      initial={false}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              y: isDockActive ? -4 : 0,
            }
      }
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      style={{ boxShadow: dockShadow }}
      className={clsx(
        "pointer-events-auto mx-auto w-full max-w-[960px] rounded-[20px] border border-white/8 bg-slate-900/80 px-4 py-4 sm:px-6",
        "ring-1 ring-inset ring-white/6 backdrop-blur-2xl transition-colors duration-quick ease-smooth",
        isDockActive && "border-primary-400/35 ring-primary-400/20"
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] font-medium text-slate-400">
            <span className="text-slate-200/80">Suggested prompts</span>
            <span className="text-slate-500/80"> · Tap to autofill</span>
          </p>
          <QuickActions
            onSelectAction={onSelectPrompt}
            disabled={isBusy}
            className="justify-start sm:justify-end"
          />
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
          <motion.div
            layout
            className={clsx(
              "group/input flex w-full items-end gap-2 rounded-[18px] border border-white/8 bg-slate-950/60 px-3 py-2",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-quick ease-smooth",
              isDockActive &&
                "border-primary-400/40 bg-slate-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            )}
          >
            <motion.button
              type="button"
              onClick={onAttach}
              disabled={isBusy}
              aria-label="Attach context"
              whileHover={
                isBusy || prefersReducedMotion ? undefined : { y: -1 }
              }
              whileTap={
                isBusy || prefersReducedMotion ? undefined : { scale: 0.97 }
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] text-slate-400 transition-colors duration-quick ease-snappy hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-0 disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" aria-hidden="true" />
            </motion.button>

            <div className="min-w-[200px] flex-1">
              <ChatInput
                value={value}
                onChange={handleInputChange}
                onSubmit={() => onSubmit()}
                placeholder={placeholder}
                disabled={isBusy}
                maxRows={6}
                minRows={1}
                aria-label="Chat message input"
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="px-0 py-3"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitDisabled}
              aria-label="Send message"
              whileHover={
                isSubmitDisabled || prefersReducedMotion
                  ? undefined
                  : { scale: 1.02 }
              }
              whileTap={
                isSubmitDisabled || prefersReducedMotion
                  ? undefined
                  : { scale: 0.97 }
              }
              className={clsx(
                "inline-flex h-11 min-w-[46px] items-center justify-center rounded-[16px] px-4 text-sm font-semibold text-white transition-all duration-quick ease-snappy",
                "bg-gradient-to-r from-primary-500 to-accent-500 shadow-[0_15px_35px_rgba(13,94,255,0.35)] hover:shadow-[0_20px_45px_rgba(13,94,255,0.45)]",
                "disabled:cursor-not-allowed disabled:bg-slate-700/50 disabled:text-slate-400 disabled:shadow-none"
              )}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          </motion.div>

          <p className="text-[11px] font-medium text-slate-500">
            Shift + Enter for newline · Enter to send
          </p>
        </form>
      </div>
    </motion.section>
  );
};


