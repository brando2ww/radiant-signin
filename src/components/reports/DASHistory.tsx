import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

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
        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
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

  // Mobile card view
  const MobileCard = ({ bill }: { bill: DASBill }) => (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">
          {format(new Date(bill.due_date), 'MMMM yyyy', { locale: ptBR })}
        </span>
        {getStatusBadge(bill.status, bill.due_date)}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Valor:</span>
        <span className="font-semibold">{formatCurrency(Number(bill.amount))}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Vencimento:</span>
        <span>{format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
      </div>
      {bill.paid_at && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pago em:</span>
          <span>{format(new Date(bill.paid_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Histórico DAS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum registro de DAS encontrado</p>
            <p className="text-xs mt-1">
              Cadastre suas guias DAS em Contas a Pagar com a categoria "Tributárias"
            </p>
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="md:hidden space-y-3">
              {bills.map((bill) => (
                <MobileCard key={bill.id} bill={bill} />
              ))}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block overflow-x-auto">
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
                  {bills.map((bill) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
