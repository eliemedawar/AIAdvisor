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

/** IDs of assignments the user has explicitly dismissed from the badge */
const ACKNOWLEDGED_KEY = "advisor_acknowledged_ids";
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

function getStoredIds(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveStoredIds(key: string, ids: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {}
}

// Keep alias for readability at call sites
const getNotifiedIds = () => getStoredIds(NOTIFIED_KEY);
const saveNotifiedIds = (ids: Set<number>) => saveStoredIds(NOTIFIED_KEY, ids);

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

    // Unread badge: urgent items whose IDs are NOT in the acknowledged set.
    // Once the user clicks "mark all read", those IDs are saved persistently.
    const acknowledged = getStoredIds(ACKNOWLEDGED_KEY);
    const urgentIds = items
      .filter((i) => i.urgency === "overdue" || i.urgency === "today" || i.urgency === "soon")
      .map((i) => i.id);
    const unread = urgentIds.filter((id) => !acknowledged.has(id)).length;
    setUnreadCount(unread);

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
    // Persist the IDs of all currently visible deadlines as acknowledged.
    // New deadlines that appear later (different IDs) will still show the badge.
    const existing = getStoredIds(ACKNOWLEDGED_KEY);
    const currentIds = deadlines.map((d) => d.id);
    const merged = new Set([...existing, ...currentIds]);
    // Prune IDs that are no longer in scope (past 7-day window) to avoid unbounded growth.
    const activeIds = new Set(deadlines.map((d) => d.id));
    const pruned = new Set([...merged].filter((id) => activeIds.has(id) || existing.has(id)));
    saveStoredIds(ACKNOWLEDGED_KEY, pruned);
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
