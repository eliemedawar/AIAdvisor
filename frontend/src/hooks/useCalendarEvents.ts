import { useEffect, useState, useMemo } from "react";
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
    await load();
  };

  // Memoized map of events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  // Memoized sorted events by time
  const sortedEvents = useMemo(() => sortEventsByTime(events), [events]);

  return { events, eventsByDate, sortedEvents, loading, error, refresh };
};


