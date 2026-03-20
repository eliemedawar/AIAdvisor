import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle } from "lucide-react";
import {
  PageShell,
  PageSection,
  Heading,
  Text,
  Card,
  Button,
  EmptyState,
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
  ViewMode,
} from "../../components/calendar";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { buildMonthGrid, buildWeekView } from "../../utils/calendar";
import { addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { plannerApi, type CreateEventPayload, type Course, type Assignment } from "../../api/plannerApi";
import { useToast } from "../../context/ToastContext";

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1]
    }
  },
};

export const CalendarPage = () => {
  const { events, eventsByDate, loading, error, refresh } = useCalendarEvents();
  const viewport = useBreakpoint();
  const { showSuccess, showError } = useToast();

  // View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Add Event modal
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventDateKey, setAddEventDateKey] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formType, setFormType] = useState("study");
  const [formCourse, setFormCourse] = useState<string>("");
  const [formAssignment, setFormAssignment] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Auto-switch to agenda on mobile-width viewports
  const effectiveViewMode = viewport.isMobile ? "agenda" : viewMode;

  // Build calendar grids
  const monthWeeks = useMemo(
    () => buildMonthGrid(currentDate, selectedDate),
    [currentDate, selectedDate]
  );

  const weekDays = useMemo(
    () => buildWeekView(currentDate, selectedDate),
    [currentDate, selectedDate]
  );

  // Navigation handlers
  const handlePrevious = () => {
    if (effectiveViewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (effectiveViewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDateKey(null), 200);
  };

  // Day selection handlers — clicking the same day again closes the panel (toggle)
  const handleDayClick = (dateKey: string) => {
    if (isPanelOpen && selectedDateKey === dateKey) {
      handleClosePanel();
    } else {
      setSelectedDateKey(dateKey);
      setIsPanelOpen(true);
    }
  };

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
    setIsAddEventOpen(true);
  };

  useEffect(() => {
    if (isAddEventOpen) {
      plannerApi.listCourses().then(setCourses).catch(() => setCourses([]));
      plannerApi.listAssignments().then(setAssignments).catch(() => setAssignments([]));
    }
  }, [isAddEventOpen]);

  const handleCreateEvent = async () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;
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

  const handleCompleteEvent = async (event: import("../../api/plannerApi").CalendarEvent) => {
    try {
      if (event.assignment !== null) {
        // Mark the linked assignment as done AND remove the calendar event
        await plannerApi.updateAssignment(event.assignment, { status: "done" });
        await plannerApi.deleteEvent(event.id);
        showSuccess("Marked complete", `${event.title} has been marked as done.`);
      } else {
        // No linked assignment — just remove the calendar event
        await plannerApi.deleteEvent(event.id);
        showSuccess("Event removed", `${event.title} has been removed from your calendar.`);
      }
      refresh();
    } catch {
      showError("Failed to complete", "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <PageSection>
          <header>
            <Heading level="h1">Calendar</Heading>
            <Text variant="body" color="muted" className="mt-2">
              Your academic planner for events, deadlines, and study sessions.
            </Text>
          </header>
          <SkeletonCard />
        </PageSection>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <PageSection>
          <Heading level="h1">Calendar</Heading>
          <Card variant="elevated">
            <EmptyState
              icon={<AlertCircle className="h-8 w-8" />}
              title="Unable to load calendar"
              description={error}
            />
          </Card>
        </PageSection>
      </PageShell>
    );
  }

  // Get events for selected day
  const selectedDayEvents = selectedDateKey ? eventsByDate.get(selectedDateKey) || [] : [];

  return (
    <PageShell>
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <PageSection>
          {/* Page Header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Heading level="h1">Calendar</Heading>
              <Text variant="body" color="muted" className="mt-2">
                View and manage your upcoming study plans and deadlines.
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => openAddEvent()}
              >
                Add Event
              </Button>
            </div>
          </header>

          {/* Calendar Card */}
          <Card variant="elevated">
            {/* Toolbar */}
            <div className="mb-6">
              <CalendarToolbar
                currentDate={currentDate}
                viewMode={effectiveViewMode}
                onViewModeChange={setViewMode}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
              />
            </div>

            {/* View Content with Transitions */}
            <AnimatePresence mode="wait">
              {effectiveViewMode === "month" && (
                <motion.div
                  key="month"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                >
                  <MonthGrid
                    weeks={monthWeeks}
                    eventsByDate={eventsByDate}
                    onDayClick={handleDayClick}
                    onAddEvent={openAddEvent}
                  />
                </motion.div>
              )}

              {effectiveViewMode === "week" && (
                <motion.div
                  key="week"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                >
                  <WeekView
                    days={weekDays}
                    eventsByDate={eventsByDate}
                    onDayClick={handleDayClick}
                  />
                </motion.div>
              )}

              {effectiveViewMode === "agenda" && (
                <motion.div
                  key="agenda"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                >
                  <AgendaView events={events} onAddEvent={() => openAddEvent()} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </PageSection>
      </motion.div>

      {/* Day Details Panel (Desktop & large tablet) */}
      {!viewport.isMobile && (
        <DayDetailsPanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          dateKey={selectedDateKey}
          events={selectedDayEvents}
          onAddEvent={() => openAddEvent(selectedDateKey || undefined)}
          onComplete={handleCompleteEvent}
        />
      )}

      {/* Day Details Modal (Mobile) */}
      {viewport.isMobile && (
        <Modal
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          title={selectedDateKey ? `Events for ${selectedDateKey}` : "Day Details"}
          size="sm"
        >
          <div className="space-y-3">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="text-sm">
                  <h4 className="font-semibold text-slate-200">{event.title}</h4>
                  <p className="text-xs text-slate-400">{event.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No events scheduled for this day.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Add Event Modal */}
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
            <Button variant="primary" size="sm" onClick={handleCreateEvent} loading={saving} disabled={!formTitle.trim() || !formStart || !formEnd}>
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
                onChange={(e) => setFormStart(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">End</label>
              <input
                type="datetime-local"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
          <Select label="Type" value={formType} onChange={(e) => setFormType(e.target.value)}>
            <option value="study">Study</option>
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
