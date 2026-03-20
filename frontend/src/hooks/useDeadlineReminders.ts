/**
 * useDeadlineReminders
 *
 * Loads upcoming assignments, computes urgency tiers, fires browser
 * notifications (with user permission), and returns a sorted list of
 * upcoming deadlines so the TopBar bell can display them.
 *
 * Urgency tiers:
 *   • overdue  – past due, not done
 *   • today    – due within 24 h
 *   • soon     – due within 72 h
 *   • upcoming – due within 7 days
 */

import { useEffect, useRef, useState } from "react";
import { plannerApi, type Assignment } from "../api/plannerApi";

export type DeadlineUrgency = "overdue" | "today" | "soon" | "upcoming";

export interface DeadlineItem {
  id: number;
  title: string;
  courseCode: string;
  dueAt: Date;
  urgency: DeadlineUrgency;
  type: string;
}

interface UseDeadlineRemindersState {
  deadlines: DeadlineItem[];
  unreadCount: number;
  markAllRead: () => void;
  notificationPermission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
}

const STORAGE_KEY = "advisor_reminders_read_at";
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // re-check every 5 minutes
const NOTIFIED_KEY = "advisor_notified_ids"; // track already-notified assignment IDs

function getUrgency(dueAt: Date, now: Date): DeadlineUrgency | null {
  const msUntil = dueAt.getTime() - now.getTime();
  if (msUntil < 0) return "overdue";
  if (msUntil < 24 * 60 * 60 * 1000) return "today";
  if (msUntil < 72 * 60 * 60 * 1000) return "soon";
  if (msUntil < 7 * 24 * 60 * 60 * 1000) return "upcoming";
  return null; // more than 7 days away — skip
}

function getNotifiedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<number>) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
  } catch {}
}

function fireNotification(item: DeadlineItem) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const labels: Record<DeadlineUrgency, string> = {
    overdue: "⚠️ Overdue",
    today: "🔴 Due today",
    soon: "🟡 Due soon",
    upcoming: "🔵 Upcoming",
  };

  new Notification(`${labels[item.urgency]}: ${item.title}`, {
    body: `${item.courseCode} · ${item.dueAt.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    icon: "/favicon.ico",
    tag: `deadline-${item.id}`, // prevents duplicate OS popups for same item
  });
}

export const useDeadlineReminders = (): UseDeadlineRemindersState => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const computeAndNotify = async () => {
    let assignments: Assignment[] = [];
    try {
      assignments = await plannerApi.listAssignments();
    } catch {
      return;
    }

    let courses: { id: number; code: string }[] = [];
    try {
      courses = await plannerApi.listCourses();
    } catch {}
    const courseCodeById = Object.fromEntries(courses.map((c) => [c.id, c.code]));

    const now = new Date();
    const items: DeadlineItem[] = [];

    for (const a of assignments) {
      if (a.status === "done") continue;
      const dueAt = new Date(a.due_at);
      const urgency = getUrgency(dueAt, now);
      if (!urgency) continue;
      items.push({
        id: a.id,
        title: a.title,
        courseCode: courseCodeById[a.course] ?? String(a.course),
        dueAt,
        urgency,
        type: a.type,
      });
    }

    // Sort: overdue first, then by nearest due date
    const urgencyOrder: Record<DeadlineUrgency, number> = {
      overdue: 0,
      today: 1,
      soon: 2,
      upcoming: 3,
    };
    items.sort((a, b) => {
      const diff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return diff !== 0 ? diff : a.dueAt.getTime() - b.dueAt.getTime();
    });

    setDeadlines(items);

    // Unread = items added after the last "mark all read" timestamp
    const lastRead = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
    const unread = items.filter(
      (i) => i.urgency === "overdue" || i.urgency === "today" || i.urgency === "soon"
    ).length;
    // Only show badge for urgent items the user hasn't acknowledged
    const hasNewSinceRead = Date.now() - lastRead > 60_000; // reset badge after 1 min
    setUnreadCount(hasNewSinceRead ? unread : 0);

    // Fire browser notifications for newly urgent items
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const notified = getNotifiedIds();
      const newlyNotified = new Set(notified);
      for (const item of items) {
        if ((item.urgency === "overdue" || item.urgency === "today" || item.urgency === "soon") && !notified.has(item.id)) {
          fireNotification(item);
          newlyNotified.add(item.id);
        }
      }
      saveNotifiedIds(newlyNotified);
    }
  };

  useEffect(() => {
    void computeAndNotify();
    intervalRef.current = setInterval(() => void computeAndNotify(), CHECK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setUnreadCount(0);
  };

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      void computeAndNotify();
    }
  };

  return {
    deadlines,
    unreadCount,
    markAllRead,
    notificationPermission: permission,
    requestPermission,
  };
};
