/**
 * useNotifications
 *
 * Generates rich in-app notifications from real planner / dashboard data:
 *   • deadline      – upcoming / overdue assignments (within 7 days)
 *   • task          – tasks due today or high-priority pending tasks
 *   • study         – calendar events scheduled today
 *   • academic_warning – GPA status (positive reinforcement or caution)
 *   • motivation    – daily rotating motivational message
 *   • system_reminder – empty planner / empty calendar prompts
 *
 * Read state is persisted in localStorage.
 * "Clear all" is in-memory only (resets on page reload so deadlines resurface).
 */

import { useEffect, useRef, useState } from "react";
import { plannerApi } from "../api/plannerApi";
import { dashboardApi } from "../api/dashboardApi";

export type NotificationType =
  | "deadline"
  | "task"
  | "study"
  | "academic_warning"
  | "motivation"
  | "system_reminder";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

// ── Persistence ───────────────────────────────────────────────────────────────

const READ_KEY = "advisor_notif_read_v1";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {}
}

// ── Motivation pool ───────────────────────────────────────────────────────────

const MOTIVATION_POOL = [
  "You're making steady progress. Every small step adds up — keep going!",
  "Consistency beats intensity. Showing up today is what matters most.",
  "Your future self will thank you for the work you're putting in right now.",
  "Great academic results come from small daily disciplined choices.",
  "You've got this. Focus on progress, not perfection.",
  "Hard work in the short term creates freedom in the long term.",
  "Review your notes today — a little revision goes a long way before exams.",
];

// ── Sort order ────────────────────────────────────────────────────────────────

const TYPE_ORDER: Record<NotificationType, number> = {
  deadline: 0,
  task: 1,
  academic_warning: 2,
  study: 3,
  system_reminder: 4,
  motivation: 5,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // In-memory cleared set: resets on page reload so deadlines resurface naturally
  const clearedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Core generator ────────────────────────────────────────────────────────

  const generate = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86_400_000);
    const todayKey = today.toISOString().split("T")[0];
    const dayIdx = Math.floor(now.getTime() / 86_400_000);

    const raw: Omit<AppNotification, "read">[] = [];

    // ── 1. Deadlines ──────────────────────────────────────────────────────────
    try {
      const [assignments, courses] = await Promise.all([
        plannerApi.listAssignments(),
        plannerApi.listCourses(),
      ]);
      const codeMap = Object.fromEntries(courses.map((c) => [c.id, c.code]));

      for (const a of assignments) {
        if (a.status === "done") continue;
        const dueAt = new Date(a.due_at);
        const msLeft = dueAt.getTime() - now.getTime();
        if (msLeft >= 7 * 86_400_000) continue;

        let title: string;
        if (msLeft < 0) title = "Overdue assignment";
        else if (msLeft < 86_400_000) title = "Due today";
        else if (msLeft < 3 * 86_400_000) title = "Due in a few days";
        else title = "Upcoming deadline";

        const code = codeMap[a.course] ?? "—";
        const dateStr = dueAt.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const timeStr = dueAt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        raw.push({
          id: `deadline-${a.id}`,
          type: "deadline",
          title,
          message:
            msLeft < 86_400_000
              ? `${a.title} (${code}) — due at ${timeStr}`
              : `${a.title} (${code}) — due ${dateStr}`,
          time: dueAt,
        });
      }
    } catch {
      // silently ignore API errors; show whatever we have
    }

    // ── 2. Tasks ──────────────────────────────────────────────────────────────
    try {
      const tasks = await plannerApi.listTasks();
      const pending = tasks.filter((t) => t.status !== "done");
      const dueToday = pending.filter((t) => {
        if (!t.due_at) return false;
        const d = new Date(t.due_at);
        return d >= today && d < tomorrow;
      });
      const highPri = pending.filter((t) => t.priority === "high");

      if (dueToday.length > 0) {
        raw.push({
          id: `task-today-${todayKey}`,
          type: "task",
          title:
            dueToday.length === 1
              ? "1 task due today"
              : `${dueToday.length} tasks due today`,
          message:
            dueToday.length === 1
              ? `"${dueToday[0].title}" is on your list for today.`
              : `"${dueToday[0].title}" and ${dueToday.length - 1} more ${dueToday.length - 1 === 1 ? "task" : "tasks"} due today.`,
          time: now,
        });
      } else if (highPri.length > 0) {
        raw.push({
          id: `task-hipri-${todayKey}`,
          type: "task",
          title: "High-priority tasks pending",
          message: `You have ${highPri.length} high-priority ${highPri.length === 1 ? "task" : "tasks"} pending. Consider scheduling time today.`,
          time: now,
        });
      } else if (tasks.length === 0) {
        raw.push({
          id: `sysrem-no-tasks-${todayKey}`,
          type: "system_reminder",
          title: "Task list is empty",
          message: "Add tasks to your planner to stay on top of your study work.",
          time: now,
        });
      }
    } catch {}

    // ── 3. Calendar events ────────────────────────────────────────────────────
    try {
      const events = await plannerApi.listEvents();
      const upcoming = events
        .filter((e) => {
          const s = new Date(e.start_at);
          return s >= now && s <= new Date(now.getTime() + 7 * 86_400_000);
        })
        .sort(
          (a, b) =>
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        );

      if (events.length === 0) {
        raw.push({
          id: `sysrem-no-events-${todayKey}`,
          type: "system_reminder",
          title: "Calendar is empty",
          message:
            "No events scheduled. Add study sessions or exam dates to your calendar.",
          time: now,
        });
      } else if (upcoming.length > 0) {
        const next = upcoming[0];
        const start = new Date(next.start_at);
        const isToday = start >= today && start < tomorrow;
        if (isToday) {
          raw.push({
            id: `study-event-${next.id}-${todayKey}`,
            type: "study",
            title: "Event scheduled today",
            message: `"${next.title}" starts at ${start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}. Be prepared!`,
            time: start,
          });
        }
      }
    } catch {}

    // ── 4. Academic progress ──────────────────────────────────────────────────
    try {
      const overview = await dashboardApi.getOverview();
      if (overview.current_gpa != null) {
        const gpa = overview.current_gpa;
        if (gpa >= 3.0) {
          raw.push({
            id: `academic-gpa-good-${todayKey}`,
            type: "academic_warning",
            title: "You're on track",
            message: `Current GPA: ${gpa.toFixed(2)}. Keep up the consistent effort!`,
            time: now,
          });
        } else if (gpa > 0 && gpa < 2.5) {
          raw.push({
            id: `academic-gpa-low-${todayKey}`,
            type: "academic_warning",
            title: "GPA needs attention",
            message: `Your GPA is ${gpa.toFixed(2)}. Consider reviewing your study plan with your advisor.`,
            time: now,
          });
        }
      }
    } catch {}

    // ── 5. Daily motivation ───────────────────────────────────────────────────
    raw.push({
      id: `motivation-${dayIdx}`,
      type: "motivation",
      title: "Daily reminder",
      message: MOTIVATION_POOL[dayIdx % MOTIVATION_POOL.length],
      time: now,
    });

    // Apply read & cleared state, sort
    const readIds = getReadIds();
    const cleared = clearedRef.current;

    const result: AppNotification[] = raw
      .filter((n) => !cleared.has(n.id))
      .map((n) => ({ ...n, read: readIds.has(n.id) }))
      .sort((a, b) => {
        const td = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        return td !== 0 ? td : b.time.getTime() - a.time.getTime();
      });

    setNotifications(result);
    setUnreadCount(result.filter((n) => !n.read).length);
  };

  useEffect(() => {
    void generate();
    intervalRef.current = setInterval(() => void generate(), 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const markAllRead = () => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = (id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  /** Clear all in-memory (resets on page reload) */
  const clearAll = () => {
    notifications.forEach((n) => clearedRef.current.add(n.id));
    setNotifications([]);
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead, markRead, clearAll };
}
