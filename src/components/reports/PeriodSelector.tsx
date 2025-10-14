import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PeriodFilter } from '@/hooks/use-reports';
import { cn } from '@/lib/utils';

interface PeriodSelectorProps {
  period: PeriodFilter;
  onChange: (period: PeriodFilter) => void;
  compareEnabled: boolean;
  onCompareToggle: (enabled: boolean) => void;
}

const presetPeriods = [
  {
    label: 'Este Mês',
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      label: 'Este Mês',
    }),
  },
  {
    label: 'Mês Passado',
    getValue: () => ({
      startDate: startOfMonth(subMonths(new Date(), 1)),
      endDate: endOfMonth(subMonths(new Date(), 1)),
      label: 'Mês Passado',
    }),
  },
  {
    label: 'Últimos 3 Meses',
    getValue: () => ({
      startDate: startOfMonth(subMonths(new Date(), 2)),
      endDate: endOfMonth(new Date()),
      label: 'Últimos 3 Meses',
    }),
  },
  {
    label: 'Este Ano',
    getValue: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date()),
      label: 'Este Ano',
    }),
  },
  {
    label: 'Ano Passado',
    getValue: () => ({
      startDate: startOfYear(subYears(new Date(), 1)),
      endDate: endOfYear(subYears(new Date(), 1)),
      label: 'Ano Passado',
    }),
  },
];

export const PeriodSelector = ({
  period,
  onChange,
  compareEnabled,
  onCompareToggle,
}: PeriodSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start text-left font-normal min-w-[240px]")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {period.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Períodos Rápidos</p>
              <div className="grid gap-2">
                {presetPeriods.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      onChange(preset.getValue());
                      setIsOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t">
              <Switch
                id="compare"
                checked={compareEnabled}
                onCheckedChange={onCompareToggle}
              />
              <Label htmlFor="compare" className="text-sm">
                Comparar com período anterior
              </Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
