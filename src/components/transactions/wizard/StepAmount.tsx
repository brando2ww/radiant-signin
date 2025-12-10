import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface StepAmountProps {
  amount: number | string;
  date: Date;
  onAmountChange: (value: number | string) => void;
  onDateChange: (date: Date) => void;
}

export const StepAmount = ({
  amount,
  date,
  onAmountChange,
  onDateChange,
}: StepAmountProps) => {
  const handleQuickDate = (option: "today" | "yesterday" | "custom") => {
    if (option === "today") {
      onDateChange(new Date());
    } else if (option === "yesterday") {
      onDateChange(subDays(new Date(), 1));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Qual o valor?</h2>
        <p className="text-sm text-muted-foreground">
          Informe o valor e a data da transação
        </p>
      </div>

      {/* Valor */}
      <div className="space-y-4">
        <div className="text-center">
          <CurrencyInput
            value={amount}
            onChange={(v) => onAmountChange(v === "" ? "" : parseFloat(v))}
            className="text-3xl font-bold text-center border-0 border-b-2 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary h-auto py-2"
          />
        </div>
      </div>

      {/* Data */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-center">Quando aconteceu?</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            type="button"
            variant={isToday(date) ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickDate("today")}
            className="rounded-full"
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant={isYesterday(date) ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickDate("yesterday")}
            className="rounded-full"
          >
            Ontem
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={!isToday(date) && !isYesterday(date) ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                {!isToday(date) && !isYesterday(date)
                  ? format(date, "dd/MM/yyyy", { locale: ptBR })
                  : "Outra data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && onDateChange(d)}
                locale={ptBR}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
