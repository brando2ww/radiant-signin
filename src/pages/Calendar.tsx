import { useState } from 'react';
import { SessionNavBar } from "@/components/ui/sidebar";
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventsList } from '@/components/calendar/EventsList';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { MonthSummary } from '@/components/calendar/MonthSummary';
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState({
    showBills: true,
    showTransactions: true,
    showCards: true,
    status: 'all' as 'all' | 'pending' | 'paid' | 'overdue',
  });

  const { data: events = [], isLoading } = useCalendarEvents(currentMonth, filters);

  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 ml-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agenda</h1>
            <p className="text-muted-foreground">
              Organize seus compromissos e eventos financeiros.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96" />
              </div>
            </div>
          ) : (
            <>
              <MonthSummary events={events} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <CalendarView
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    events={events}
                  />
                </div>

                <div className="space-y-6">
                  <CalendarFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />

                  <Card className="p-4 max-h-[600px] overflow-y-auto">
                    <EventsList
                      events={events}
                      selectedDate={selectedDate}
                    />
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
