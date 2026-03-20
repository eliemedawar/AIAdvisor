import { useEffect, useState, useMemo, useRef } from "react";
import { CalendarEvent, plannerApi } from "../api/plannerApi";
import { groupEventsByDate, sortEventsByTime } from "../utils/calendar";

interface UseCalendarEventsState {
  events: CalendarEvent[];
  eventsByDate: Map<string, CalendarEvent[]>;
  sortedEvents: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCalendarEvents = (): UseCalendarEventsState => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const lastRefreshAt = useRef<number>(0);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plannerApi.listEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const refresh = async () => {
    const now = Date.now();
    if (now - lastRefreshAt.current < 5000) {
      return;
    }
    lastRefreshAt.current = now;
    await load();
  };

  // When the user comes back to the tab (or switches windows), refresh so
  // AI-confirmed changes show up without a manual reload.
  useEffect(() => {
    const maybeRefresh = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("focus", maybeRefresh);
    document.addEventListener("visibilitychange", maybeRefresh);
    return () => {
      window.removeEventListener("focus", maybeRefresh);
      document.removeEventListener("visibilitychange", maybeRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized map of events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  // Memoized sorted events by time
  const sortedEvents = useMemo(() => sortEventsByTime(events), [events]);

  return { events, eventsByDate, sortedEvents, loading, error, refresh };
};


