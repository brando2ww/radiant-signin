import { useState } from 'react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { EventsTimeline } from '@/components/calendar/EventsTimeline';
import { EventDetailsPanel } from '@/components/calendar/EventDetailsPanel';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { MonthSummary } from '@/components/calendar/MonthSummary';
import { SearchBar } from '@/components/calendar/SearchBar';
import { useCalendarEvents, CalendarEvent } from '@/hooks/use-calendar-events';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    showBills: true,
    showTransactions: true,
    showCards: true,
    showTasks: true,
    status: 'all' as 'all' | 'pending' | 'paid' | 'overdue',
  });

  const { data: events = [], isLoading } = useCalendarEvents(currentMonth, filters);

  // Filter events by search query
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout className="p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agenda Financeira</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie seus compromissos financeiros
            </p>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-[350px]" />
              <Skeleton className="h-[200px]" />
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="h-[600px]" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-[600px]" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Mini Calendar + Summary + Filters */}
            <div className="lg:col-span-3 space-y-4">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
              <MonthSummary events={events} />
              <CalendarFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Center Column - Events Timeline */}
            <div className="lg:col-span-5">
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <EventsTimeline
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                  selectedDate={selectedDate}
                />
              </div>
            </div>

            {/* Right Column - Event Details */}
            <div className="lg:col-span-4">
              <div className="sticky top-4">
                <EventDetailsPanel event={selectedEvent} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
