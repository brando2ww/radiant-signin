import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CategoryDistributionChart } from '../CategoryDistributionChart';

interface DRETabProps {
  reportData: any;
}

export const DRETab = ({ reportData }: DRETabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const safePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  const { summary, expenseByCategory, comparison } = reportData;

  const dreData = [
    {
      label: 'RECEITA BRUTA',
      value: summary.totalRevenue,
      level: 0,
      isBold: true,
      percentage: 100,
      change: comparison?.revenue.change,
    },
    {
      label: 'RECEITA LÍQUIDA',
      value: summary.totalRevenue,
      level: 0,
      isBold: true,
      isTotal: true,
      percentage: 100,
    },
    {
      label: 'DESPESAS OPERACIONAIS',
      value: -summary.totalExpense,
      level: 0,
      isBold: true,
      percentage: safePercentage(summary.totalExpense, summary.totalRevenue),
      change: comparison?.expense.change,
    },
    ...expenseByCategory.map(cat => ({
      label: cat.category,
      value: -cat.value,
      level: 1,
      percentage: cat.percentage,
    })),
    {
      label: 'LUCRO/PREJUÍZO OPERACIONAL',
      value: summary.profit,
      level: 0,
      isBold: true,
      isTotal: true,
      percentage: summary.profitMargin,
      change: comparison?.profit.change,
    },
    {
      label: 'LUCRO/PREJUÍZO LÍQUIDO',
      value: summary.profit,
      level: 0,
      isBold: true,
      isTotal: true,
      isHighlight: true,
      percentage: summary.profitMargin,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração do Resultado do Exercício (DRE)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% Receita</TableHead>
                {comparison && <TableHead className="text-right">Variação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dreData.map((item, index) => (
                <TableRow
                  key={index}
                  className={item.isHighlight ? 'bg-primary/5 border-t-2 border-b-2' : item.isTotal ? 'border-t' : ''}
                >
                  <TableCell
                    className={`${item.isBold ? 'font-bold' : ''} ${item.level === 1 ? 'pl-8' : ''}`}
                  >
                    {item.label}
                  </TableCell>
                  <TableCell
                    className={`text-right ${item.isBold ? 'font-bold' : ''} ${
                      item.value > 0 ? 'text-green-600' : item.value < 0 ? 'text-red-600' : ''
                    }`}
                  >
                    {formatCurrency(Math.abs(item.value))}
                  </TableCell>
                  <TableCell className={`text-right ${item.isBold ? 'font-bold' : ''}`}>
                    {item.percentage !== undefined && isFinite(item.percentage) 
                      ? `${item.percentage.toFixed(1)}%` 
                      : '-'}
                  </TableCell>
                  {comparison && (
                    <TableCell className="text-right">
                      {item.change !== undefined ? (
                        <Badge variant={item.change >= 0 ? 'default' : 'destructive'}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Indicadores Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Margem Bruta</span>
              <span className="text-xl font-bold">{isFinite(summary.profitMargin) ? summary.profitMargin.toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Margem Operacional</span>
              <span className="text-xl font-bold">{isFinite(summary.profitMargin) ? summary.profitMargin.toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Margem Líquida</span>
              <span className="text-xl font-bold">{isFinite(summary.profitMargin) ? summary.profitMargin.toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
              <span className="font-medium">Lucro/Prejuízo</span>
              <span className={`text-xl font-bold ${summary.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(summary.profit)}
              </span>
            </div>
          </CardContent>
        </Card>

        <CategoryDistributionChart
          data={expenseByCategory}
          title="Composição de Despesas"
        />
      </div>
    </div>
  );
};
