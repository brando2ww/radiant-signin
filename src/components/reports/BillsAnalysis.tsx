import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BillsAnalysisProps {
  bills: {
    paid: any[];
    pending: any[];
    pendingRevenue: number;
    pendingExpense: number;
  };
}

export const BillsAnalysis = ({ bills }: BillsAnalysisProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const today = new Date();
  const overdueBills = bills.pending.filter(b => new Date(b.due_date) < today);
  const upcomingBills = bills.pending.filter(b => {
    const dueDate = new Date(b.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">A Receber</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(bills.pendingRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">A Pagar</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(bills.pendingExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Previsto</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(bills.pendingRevenue - bills.pendingExpense)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueBills.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Contas Atrasadas ({overdueBills.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBills.slice(0, 5).map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.title}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(bill.due_date), "dd 'de' MMM", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bill.type === 'income' ? 'default' : 'destructive'}>
                        {bill.type === 'income' ? 'Receber' : 'Pagar'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(Number(bill.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {upcomingBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vencimentos Próximos (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBills.slice(0, 5).map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.title}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(bill.due_date), "dd 'de' MMM", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={bill.type === 'income' ? 'default' : 'secondary'}>
                        {bill.type === 'income' ? 'Receber' : 'Pagar'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(Number(bill.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
