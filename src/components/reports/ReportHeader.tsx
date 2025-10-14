import { PeriodSelector } from './PeriodSelector';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PeriodFilter } from '@/hooks/use-reports';

interface ReportHeaderProps {
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  compareEnabled: boolean;
  onCompareToggle: (enabled: boolean) => void;
  onExport?: () => void;
}

export const ReportHeader = ({
  period,
  onPeriodChange,
  compareEnabled,
  onCompareToggle,
  onExport,
}: ReportHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <p className="text-muted-foreground mt-1">
          Análise detalhada das suas finanças
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <PeriodSelector
          period={period}
          onChange={onPeriodChange}
          compareEnabled={compareEnabled}
          onCompareToggle={onCompareToggle}
        />
        
        {onExport && (
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </div>
    </div>
  );
};
