/**
 * DateSeparator - Shows date labels between messages
 * 
 * Features:
 * - Formats dates as "Today", "Yesterday", or "Day, Month Date"
 * - Center-aligned with decorative lines
 * - Minimal styling that doesn't distract from chat
 * 
 * Usage:
 * ```tsx
 * <DateSeparator date="2024-11-21" />
 * ```
 */

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => {
  const formatDate = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    const resetTime = (d: Date) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const messageDateReset = resetTime(new Date(messageDate));
    const todayReset = resetTime(new Date(today));
    const yesterdayReset = resetTime(new Date(yesterday));

    if (messageDateReset.getTime() === todayReset.getTime()) {
      return "Today";
    } else if (messageDateReset.getTime() === yesterdayReset.getTime()) {
      return "Yesterday";
    } else {
      // Format as "Monday, Nov 18"
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-px flex-1 bg-slate-800/60" />
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {formatDate(date)}
      </span>
      <div className="h-px flex-1 bg-slate-800/60" />
    </div>
  );
};

/**
 * Helper function to group messages by date
 */
export const groupMessagesByDate = <T extends { created_at: string }>(
  messages: T[]
): { date: string; messages: T[] }[] => {
  const groups: { [date: string]: T[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.created_at).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return Object.entries(groups)
    .map(([date, msgs]) => ({ date, messages: msgs }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

