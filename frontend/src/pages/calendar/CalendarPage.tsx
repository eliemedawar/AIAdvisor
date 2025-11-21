import { useState, useMemo } from "react";
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
  const { events, eventsByDate, loading, error } = useCalendarEvents();
  const viewport = useBreakpoint();

  // View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  // Day selection handlers
  const handleDayClick = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setIsPanelOpen(true);
  };

  const handleAddEvent = (dateKey?: string) => {
    // Placeholder for future event creation
    console.log("Add event", dateKey || "general");
    // TODO: Open event creation modal/form
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDateKey(null), 200); // Delay clearing to allow exit animation
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
                onClick={() => handleAddEvent()}
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
                    onAddEvent={handleAddEvent}
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
                  <AgendaView events={events} onAddEvent={() => handleAddEvent()} />
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
          onAddEvent={() => handleAddEvent(selectedDateKey || undefined)}
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
    </PageShell>
  );
};
