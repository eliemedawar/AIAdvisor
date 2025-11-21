import {
  forwardRef,
  TextareaHTMLAttributes,
  useEffect,
  useRef,
  KeyboardEvent,
  CSSProperties,
} from "react";
import clsx from "clsx";

interface ChatInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  onSubmit?: () => void;
  maxRows?: number;
  minRows?: number;
}

/**
 * AutoResizeTextarea - Chat input that grows from 1 to 6 lines
 * 
 * Features:
 * - Auto-grows from 1 line to max 6 lines, then scrolls
 * - Enter to submit, Shift+Enter for newline
 * - Matches design system styling
 * 
 * Usage:
 * ```tsx
 * <ChatInput 
 *   value={input}
 *   onChange={(e) => setInput(e.target.value)}
 *   onSubmit={handleSubmit}
 *   placeholder="Ask about your schedule..."
 * />
 * ```
 */
export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({
    onSubmit,
    maxRows = 6,
    minRows = 1,
    className,
    onKeyDown,
    style,
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const textareaRef = (ref as React.MutableRefObject<HTMLTextAreaElement | null>) || internalRef;
    const mergedStyle: CSSProperties = {
      transition: "height 160ms cubic-bezier(0.4, 0, 0.2, 1)",
      ...(style || {}),
    };

    // Auto-resize textarea based on content
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      
      // Calculate line height
      const style = window.getComputedStyle(textarea);
      const parsedLineHeight = parseInt(style.lineHeight, 10);
      const lineHeight = Number.isNaN(parsedLineHeight) ? 20 : parsedLineHeight;
      
      // Calculate min and max heights
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      // Set new height (capped at max)
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = Math.max(newHeight, minHeight) + "px";
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    // Adjust height when value changes
    useEffect(() => {
      adjustHeight();
    }, [props.value, maxRows, minRows]);

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
      
      onKeyDown?.(e);
    };

    return (
      <textarea
        ref={textareaRef}
        rows={minRows}
        onKeyDown={handleKeyDown}
        className={clsx(
          "scrollable w-full resize-none bg-transparent px-0 py-2 text-[15px] leading-relaxed text-slate-100 placeholder:text-slate-500/70",
          "focus-visible:outline-none focus-visible:ring-0",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className
        )}
        style={mergedStyle}
        {...props}
      />
    );
  }
);

ChatInput.displayName = "ChatInput";

