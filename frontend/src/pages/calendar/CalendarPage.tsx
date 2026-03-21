import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { AppLayout } from '../../layouts/AppLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { addMonths, subMonths } from 'date-fns';

interface CalendarCellProps {
  date: Date;
  events: any[];
  isSelected: boolean;
  onSelect: (date: Date) => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  events,
  isSelected,
  onSelect,
}) => {
  const eventColors: { [key: string]: string } = {
    exam: 'bg-danger',
    class: 'bg-indigo-neon-600',
    study: 'bg-teal-neon-600',
    other: 'bg-gray-600',
  };

  return (
    <div
      onClick={() => onSelect(date)}
      className={`min-h-24 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-indigo-neon-600/20 border border-indigo-neon-600'
          : 'bg-void-800 border border-void-700 hover:border-indigo-neon-600/50'
      }`}
    >
      <p className="text-sm font-medium text-gray-300 mb-2">{date.getDate()}</p>
      <div className="space-y-1">
        {events.slice(0, 3).map((event, i) => (
          <div
            key={i}
            className={`${eventColors[event.type] || eventColors.other} rounded px-2 py-1 text-xs text-white truncate`}
          >
            {event.title}
          </div>
        ))}
        {events.length > 3 && (
          <p className="text-xs text-gray-500">+{events.length - 3} more</p>
        )}
      </div>
    </div>
  );
};

export const CalendarPage: React.FC = () => {
  const { events, eventsByDate, loading, error } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-glass rounded-lg w-48 mx-auto" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-glass rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12">
          <Card variant="glass" className="border-danger/30 bg-danger/5">
            <div className="flex gap-4">
              <AlertCircle className="text-danger flex-shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold mb-1">Failed to load calendar</h3>
                <p className="text-gray-400 text-sm">Please try refreshing the page</p>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Build calendar grid
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    calendarDays.push(date);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AppLayout>
      <div className="p-6 lg:p-12">
        {/* Toolbar */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="text-2xl text-gray-400 hover:text-indigo-neon-600 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <h2 className="text-3xl font-bold text-white min-w-48 text-center">
            {monthName}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="text-2xl text-gray-400 hover:text-indigo-neon-600 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Calendar Grid */}
        <Card variant="glass" className="p-8">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-gray-500 text-sm font-medium py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, i) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = eventsByDate[dateStr] || [];
              const isCurrentMonth =
                date.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={i}
                  className={`opacity-${isCurrentMonth ? '100' : '50'}`}
                >
                  <CalendarCell
                    date={date}
                    events={dayEvents}
                    isSelected={
                      selectedDate?.toDateString() === date.toDateString()
                    }
                    onSelect={setSelectedDate}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details */}
        {selectedDate && (
          <Card variant="glass" className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            <div className="space-y-3">
              {(eventsByDate[selectedDate.toISOString().split('T')[0]] ||
                []).length > 0 ? (
                (eventsByDate[selectedDate.toISOString().split('T')[0]] || []).map(
                  (event, i) => (
                    <div
                      key={i}
                      className="bg-void-800 rounded-lg p-4 border border-void-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{event.title}</h4>
                        <Badge variant="default">{event.type}</Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{event.description}</p>
                      {event.course && (
                        <p className="text-gray-500 text-xs mt-2">{event.course}</p>
                      )}
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-500 text-sm">No events scheduled</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
