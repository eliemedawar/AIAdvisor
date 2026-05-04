import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Calendar as CalendarIcon, Clock, Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import {
  PageShell,
  Heading,
  Text,
  Card,
  Button,
  SkeletonCard,
  Modal,
  Input,
  Select,
} from "../../components";
import {
  CalendarToolbar,
  MonthGrid,
  WeekView,
  AgendaView,
  DayDetailsPanel,
  EventIndicator,
  ViewMode,
} from "../../components/calendar";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { buildMonthGrid, buildWeekView } from "../../utils/calendar";
import {
  addMonths, subMonths, addWeeks, subWeeks,
  format, parseISO, startOfDay, addDays,
  startOfWeek, endOfWeek, isWithinInterval,
} from "date-fns";
import { plannerApi, type CreateEventPayload, type Course, type Assignment, type CalendarEvent } from "../../api/plannerApi";
import { useToast } from "../../context/ToastContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDatetimeLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromDatetimeLocal(s: string): string {
  return new Date(s).toISOString();
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  study: "Study session",
  study_session: "Study session",
  class: "Class",
  exam: "Exam",
  other: "Other",
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
  },
};

// ── Datetime input class ──────────────────────────────────────────────────────

const dtInputCls =
  "w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50";
const dtInputErrCls =
  "w-full rounded-xl border border-red-500/70 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-red-500/50";

// ── Page ──────────────────────────────────────────────────────────────────────

export const CalendarPage = () => {
  const { events, eventsByDate, loading, error, refresh } = useCalendarEvents();
  const viewport = useBreakpoint();
  const { showSuccess, showError } = useToast();

  // ── View state ──────────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ── Shared data (courses/assignments for dropdowns) ─────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // ── Add Event modal ─────────────────────────────────────────────────────────
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventDateKey, setAddEventDateKey] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formType, setFormType] = useState("study");
  const [formCourse, setFormCourse] = useState<string>("");
  const [formAssignment, setFormAssignment] = useState<string>("");
  const [formDateError, setFormDateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Event detail / edit / delete modal ──────────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editType, setEditType] = useState("study");
  const [editCourse, setEditCourse] = useState("");
  const [editDateError, setEditDateError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // ── Auto-switch to agenda on mobile ────────────────────────────────────────
  const effectiveViewMode = viewport.isMobile ? "agenda" : viewMode;

  // ── Calendar grids ──────────────────────────────────────────────────────────
  const monthWeeks = useMemo(
    () => buildMonthGrid(currentDate, selectedDate),
    [currentDate, selectedDate]
  );
  const weekDays = useMemo(
    () => buildWeekView(currentDate, selectedDate),
    [currentDate, selectedDate]
  );

  // ── Load courses + assignments whenever any modal opens ─────────────────────
  useEffect(() => {
    if (isAddEventOpen || isEventModalOpen) {
      plannerApi.listCourses().then(setCourses).catch(() => setCourses([]));
      plannerApi.listAssignments().then(setAssignments).catch(() => setAssignments([]));
    }
  }, [isAddEventOpen, isEventModalOpen]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handlePrevious = () => {
    setCurrentDate(
      effectiveViewMode === "week"
        ? subWeeks(currentDate, 1)
        : subMonths(currentDate, 1)
    );
  };
  const handleNext = () => {
    setCurrentDate(
      effectiveViewMode === "week"
        ? addWeeks(currentDate, 1)
        : addMonths(currentDate, 1)
    );
  };
  const handleToday = () => setCurrentDate(new Date());

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDateKey(null), 200);
  };

  const handleDayClick = (dateKey: string) => {
    if (isPanelOpen && selectedDateKey === dateKey) {
      handleClosePanel();
    } else {
      setSelectedDateKey(dateKey);
      setIsPanelOpen(true);
    }
  };

  // ── Add Event ───────────────────────────────────────────────────────────────
  const openAddEvent = (dateKey?: string) => {
    setAddEventDateKey(dateKey ?? null);
    const base = dateKey ? new Date(dateKey + "T12:00:00") : new Date();
    const start = new Date(base);
    start.setHours(9, 0, 0, 0);
    const end = new Date(base);
    end.setHours(10, 0, 0, 0);
    setFormStart(toDatetimeLocal(start));
    setFormEnd(toDatetimeLocal(end));
    setFormTitle("");
    setFormDescription("");
    setFormType("study");
    setFormCourse("");
    setFormAssignment("");
    setFormDateError(null);
    setIsAddEventOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;
    if (new Date(formEnd) <= new Date(formStart)) {
      setFormDateError("End time must be after start time.");
      return;
    }
    setFormDateError(null);
    setSaving(true);
    try {
      const payload: CreateEventPayload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        start_at: fromDatetimeLocal(formStart),
        end_at: fromDatetimeLocal(formEnd),
        type: formType,
        course: formCourse ? Number(formCourse) : null,
        assignment: formAssignment ? Number(formAssignment) : null,
      };
      await plannerApi.createEvent(payload);
      showSuccess("Event created", "Your event has been added to the calendar.");
      setIsAddEventOpen(false);
      refresh();
    } catch (err: any) {
      showError("Failed to create event", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Event details + edit + delete ───────────────────────────────────────────
  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(false);
    setIsEventModalOpen(true);
  };

  const openEditMode = () => {
    if (!selectedEvent) return;
    setEditTitle(selectedEvent.title);
    setEditDesc(selectedEvent.description || "");
    setEditStart(toDatetimeLocal(new Date(selectedEvent.start_at)));
    setEditEnd(toDatetimeLocal(new Date(selectedEvent.end_at)));
    setEditType(selectedEvent.type || "study");
    setEditCourse(selectedEvent.course != null ? String(selectedEvent.course) : "");
    setEditDateError(null);
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || !editTitle.trim() || !editStart || !editEnd) return;
    if (new Date(editEnd) <= new Date(editStart)) {
      setEditDateError("End time must be after start time.");
      return;
    }
    setEditDateError(null);
    setIsSavingEdit(true);
    try {
      await plannerApi.updateEvent(selectedEvent.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        start_at: fromDatetimeLocal(editStart),
        end_at: fromDatetimeLocal(editEnd),
        type: editType,
        course: editCourse ? Number(editCourse) : null,
      });
      showSuccess("Event updated", editTitle.trim());
      setIsEventModalOpen(false);
      setIsEditMode(false);
      refresh();
    } catch (err: any) {
      showError("Failed to update event", err?.response?.data?.detail || "Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    setIsDeletingEvent(true);
    try {
      await plannerApi.deleteEvent(selectedEvent.id);
      showSuccess("Event deleted", `"${selectedEvent.title}" has been removed.`);
      setIsDeleteConfirmOpen(false);
      setIsEventModalOpen(false);
      refresh();
    } catch (err: any) {
      showError("Failed to delete event", err?.response?.data?.detail || "Please try again.");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // ── Complete event (existing) ────────────────────────────────────────────────
  const handleCompleteEvent = async (event: CalendarEvent) => {
    try {
      if (event.assignment !== null) {
        await plannerApi.updateAssignment(event.assignment, { status: "done" });
        await plannerApi.deleteEvent(event.id);
        showSuccess("Marked complete", `${event.title} has been marked as done.`);
      } else {
        await plannerApi.deleteEvent(event.id);
        showSuccess("Event removed", `${event.title} has been removed from your calendar.`);
      }
      refresh();
    } catch {
      showError("Failed to complete", "Something went wrong. Please try again.");
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <Heading level="h1">Calendar</Heading>
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="space-y-6">
          <Heading level="h1">Calendar</Heading>
          <Card variant="elevated">
            <div className="flex items-start gap-3 py-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error-400" />
              <div>
                <p className="text-sm font-medium text-error-200">Unable to load calendar</p>
                <p className="mt-1 text-xs text-slate-400">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const selectedDayEvents = selectedDateKey ? eventsByDate.get(selectedDateKey) || [] : [];

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEvents = events.filter((e) =>
    isWithinInterval(parseISO(e.start_at), { start: weekStart, end: weekEnd })
  );
  const thisWeekDeadlines = thisWeekEvents.filter((e) =>
    ["exam", "deadline", "assignment"].some((t) => e.type.toLowerCase().includes(t))
  );
  const thisWeekStudy = thisWeekEvents.filter((e) => e.type.toLowerCase().includes("study"));
  const nextEvent = events
    .filter((e) => parseISO(e.start_at) >= now)
    .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime())[0];

  const calendarStats = [
    { label: "This week", value: thisWeekEvents.length, sub: thisWeekEvents.length === 1 ? "event" : "events", accent: "text-primary-400" },
    { label: "Deadlines", value: thisWeekDeadlines.length, sub: "this week", accent: thisWeekDeadlines.length > 0 ? "text-red-400" : "text-slate-200" },
    { label: "Study sessions", value: thisWeekStudy.length, sub: "scheduled", accent: "text-accent-400" },
    {
      label: "Next event",
      value: nextEvent ? format(parseISO(nextEvent.start_at), "MMM d") : "—",
      sub: nextEvent ? nextEvent.title : "Nothing scheduled",
      accent: nextEvent ? "text-warning-400" : "text-slate-500",
    },
  ];

  const todayStart = startOfDay(now);
  const next7End = addDays(todayStart, 8);
  const upcomingEvents = events
    .filter((e) => {
      const d = parseISO(e.start_at);
      return d >= todayStart && d < next7End;
    })
    .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime());

  const upcomingByDate = new Map<string, CalendarEvent[]>();
  upcomingEvents.forEach((e) => {
    const key = e.start_at.slice(0, 10);
    if (!upcomingByDate.has(key)) upcomingByDate.set(key, []);
    upcomingByDate.get(key)!.push(e);
  });
  const upcomingSortedDates = [...upcomingByDate.keys()].sort();

  // Linked course name helper
  const courseNameById = Object.fromEntries(courses.map((c) => [c.id, c.code]));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <Heading level="h1">Calendar</Heading>
              <Text variant="body" color="muted" className="mt-1">
                View and manage your upcoming study plans and deadlines.
              </Text>
            </div>
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddEvent()}>
              Add Event
            </Button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {calendarStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-800/60 bg-surface-base px-4 py-3 shadow-elevation-low"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className={clsx("mt-1 text-2xl font-bold leading-none tracking-tight", s.accent)}>{s.value}</p>
                <p className="mt-1 truncate text-[11px] text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <CalendarToolbar
            currentDate={currentDate}
            viewMode={effectiveViewMode}
            onViewModeChange={setViewMode}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
          />

          {/* Main content */}
          {effectiveViewMode === "agenda" ? (
            <Card variant="elevated" padding="md">
              <AgendaView
                events={events}
                onAddEvent={() => openAddEvent()}
                onEventClick={openEventDetails}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">

              {/* Calendar grid */}
              <Card variant="elevated" padding="md">
                <AnimatePresence mode="wait">
                  {effectiveViewMode === "month" && (
                    <motion.div
                      key="month"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <MonthGrid
                        weeks={monthWeeks}
                        eventsByDate={eventsByDate}
                        onDayClick={handleDayClick}
                        onAddEvent={openAddEvent}
                        onEventClick={openEventDetails}
                      />
                    </motion.div>
                  )}
                  {effectiveViewMode === "week" && (
                    <motion.div
                      key="week"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <WeekView
                        days={weekDays}
                        eventsByDate={eventsByDate}
                        onDayClick={handleDayClick}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Upcoming 7-day panel */}
              <Card variant="elevated" padding="md">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Coming up</p>
                    <h3 className="mt-0.5 text-base font-semibold text-slate-100">Next 7 days</h3>
                  </div>
                  <Button size="sm" variant="ghost" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => openAddEvent()}>
                    Add
                  </Button>
                </div>

                {upcomingEvents.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CalendarIcon className="mb-2.5 h-8 w-8 text-slate-700" />
                    <p className="text-sm font-medium text-slate-400">Clear week ahead</p>
                    <p className="mt-1 text-xs text-slate-600">No events in the next 7 days.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSortedDates.map((dateKey) => {
                      const dayEvents = upcomingByDate.get(dateKey)!;
                      const date = parseISO(dateKey);
                      const isToday = dateKey === format(now, "yyyy-MM-dd");
                      return (
                        <div key={dateKey}>
                          <p className={clsx(
                            "mb-1.5 text-[10px] font-semibold uppercase tracking-wide",
                            isToday ? "text-primary-400" : "text-slate-500"
                          )}>
                            {isToday ? "Today" : format(date, "EEE, MMM d")}
                          </p>
                          <div className="space-y-1.5">
                            {dayEvents.map((e) => (
                              <button
                                key={e.id}
                                type="button"
                                onClick={() => openEventDetails(e)}
                                className="w-full text-left transition-opacity hover:opacity-80"
                              >
                                <EventIndicator event={e} showTime />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

            </div>
          )}

        </div>
      </motion.div>

      {/* Day Details Panel (desktop) */}
      {!viewport.isMobile && (
        <DayDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          dateKey={selectedDateKey}
          events={selectedDayEvents}
          onAddEvent={() => openAddEvent(selectedDateKey || undefined)}
          onComplete={handleCompleteEvent}
          onEventClick={openEventDetails}
        />
      )}

      {/* Day Details Modal (mobile) */}
      {viewport.isMobile && (
        <Modal
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          title={selectedDateKey ? `Events — ${format(parseISO(selectedDateKey), "MMM d")}` : "Day Details"}
          size="sm"
        >
          <div className="space-y-2">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => { handleClosePanel(); openEventDetails(event); }}
                  className="w-full text-left"
                >
                  <EventIndicator event={event} showTime />
                </button>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">No events scheduled for this day.</p>
            )}
          </div>
        </Modal>
      )}

      {/* ── Event Details / Edit Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          if (isSavingEdit) return;
          setIsEventModalOpen(false);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Edit event" : "Event details"}
        size="md"
        footer={
          isEditMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(false)}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                loading={isSavingEdit}
                disabled={!editTitle.trim() || !editStart || !editEnd || !!editDateError}
              >
                Save changes
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="mr-auto flex items-center gap-1.5 rounded-lg border border-red-800/40 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-950/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <Button variant="ghost" size="sm" onClick={() => setIsEventModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Pencil className="h-3.5 w-3.5" />}
                onClick={openEditMode}
              >
                Edit
              </Button>
            </>
          )
        }
      >
        {selectedEvent && !isEditMode && (
          <div className="space-y-4">
            {/* Type badge */}
            <div>
              <span className="inline-flex rounded-full border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-200 capitalize">
                {EVENT_TYPE_LABELS[selectedEvent.type] ?? selectedEvent.type}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold leading-snug text-slate-50">
              {selectedEvent.title}
            </h3>

            {/* Date & time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <CalendarIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{format(parseISO(selectedEvent.start_at), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-300">
                <Clock className="h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  {format(parseISO(selectedEvent.start_at), "h:mm a")}
                  {" "}–{" "}
                  {format(parseISO(selectedEvent.end_at), "h:mm a")}
                </span>
              </div>
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <p className="text-sm leading-relaxed text-slate-400">{selectedEvent.description}</p>
            )}

            {/* Course */}
            {selectedEvent.course != null && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="font-medium text-slate-300">
                  {courseNameById[selectedEvent.course] ?? `Course #${selectedEvent.course}`}
                </span>
              </div>
            )}

            {/* Source hint */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 px-3 py-2.5">
              <p className="text-[11px] text-slate-500">
                {selectedEvent.assignment != null
                  ? "Linked to an assignment · Deleting removes the event but not the assignment."
                  : selectedEvent.course != null
                  ? "Linked to a course · Part of your academic plan."
                  : "Calendar event · Added manually or via AI Advisor."}
              </p>
            </div>
          </div>
        )}

        {selectedEvent && isEditMode && (
          <div className="space-y-4">
            <Input
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. Study session"
              required
            />
            <Input
              label="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Optional"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Start *</label>
                <input
                  type="datetime-local"
                  value={editStart}
                  onChange={(e) => { setEditStart(e.target.value); setEditDateError(null); }}
                  className={dtInputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">End *</label>
                <input
                  type="datetime-local"
                  value={editEnd}
                  onChange={(e) => { setEditEnd(e.target.value); setEditDateError(null); }}
                  className={editDateError ? dtInputErrCls : dtInputCls}
                />
              </div>
            </div>
            {editDateError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {editDateError}
              </p>
            )}
            <Select
              label="Type"
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
            >
              <option value="study">Study session</option>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </Select>
            <Select
              label="Course (optional)"
              value={editCourse}
              onChange={(e) => setEditCourse(e.target.value)}
            >
              <option value="">None</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
              ))}
            </Select>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => !isDeletingEvent && setIsDeleteConfirmOpen(false)}
        title="Delete event?"
        size="sm"
        disableBackdropClose={isDeletingEvent}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isDeletingEvent}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              loading={isDeletingEvent}
            >
              Delete event
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          This will permanently remove{" "}
          <span className="font-semibold text-slate-100">"{selectedEvent?.title}"</span>{" "}
          from your calendar. This cannot be undone.
        </p>
      </Modal>

      {/* ── Add Event Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => !saving && setIsAddEventOpen(false)}
        title="Add Event"
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAddEventOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateEvent}
              loading={saving}
              disabled={!formTitle.trim() || !formStart || !formEnd || !!formDateError}
            >
              Create Event
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g. Study session"
            required
          />
          <Input
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Optional"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Start</label>
              <input
                type="datetime-local"
                value={formStart}
                onChange={(e) => { setFormStart(e.target.value); setFormDateError(null); }}
                className={dtInputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">End</label>
              <input
                type="datetime-local"
                value={formEnd}
                onChange={(e) => { setFormEnd(e.target.value); setFormDateError(null); }}
                className={formDateError ? dtInputErrCls : dtInputCls}
              />
            </div>
          </div>
          {formDateError && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {formDateError}
            </p>
          )}
          <Select label="Type" value={formType} onChange={(e) => setFormType(e.target.value)}>
            <option value="study">Study session</option>
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </Select>
          <Select label="Course (optional)" value={formCourse} onChange={(e) => setFormCourse(e.target.value)}>
            <option value="">None</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
            ))}
          </Select>
          <Select label="Assignment (optional)" value={formAssignment} onChange={(e) => setFormAssignment(e.target.value)}>
            <option value="">None</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </Select>
        </div>
      </Modal>
    </PageShell>
  );
};
