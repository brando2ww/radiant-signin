import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface DASBill {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at?: string;
}

interface DASHistoryProps {
  bills: DASBill[];
}

export const DASHistory = ({ bills }: DASHistoryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'paid') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      );
    }
    
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Atrasado
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico DAS</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competência</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum registro de DAS encontrado
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">
                    {format(new Date(bill.due_date), 'MMMM yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(Number(bill.amount))}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(bill.status, bill.due_date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {bill.paid_at
                      ? format(new Date(bill.paid_at), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
