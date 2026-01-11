import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ptBR } from 'date-fns/locale';

interface MiniCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export const MiniCalendar = ({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
}: MiniCalendarProps) => {
  return (
    <Card className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        month={currentMonth}
        onMonthChange={onMonthChange}
        locale={ptBR}
        className="rounded-md w-full"
      />
    </Card>
  );
};
