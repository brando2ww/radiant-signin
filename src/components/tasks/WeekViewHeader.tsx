import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeekViewHeaderProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export function WeekViewHeader({ currentWeek, onWeekChange }: WeekViewHeaderProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    onWeekChange(new Date());
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="flex items-center justify-between border-b bg-card p-4">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold capitalize">
          {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Hoje
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {format(weekStart, "d MMM", { locale: ptBR })} -{" "}
          {format(weekEnd, "d MMM", { locale: ptBR })}
        </span>
        <span className="text-xs text-muted-foreground">
          S{getWeekNumber(currentWeek)}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
