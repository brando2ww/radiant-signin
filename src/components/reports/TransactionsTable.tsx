import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  payment_method?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  title: string;
  type: 'income' | 'expense';
}

export const TransactionsTable = ({ transactions, title, type }: TransactionsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Group by category
  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = [];
    }
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant={type === 'income' ? 'default' : 'destructive'} className="text-base px-3 py-1">
            {formatCurrency(total)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(grouped).map(([category, items]) => {
              const categoryTotal = items.reduce((sum, t) => sum + Number(t.amount), 0);
              
              return (
                <>
                  {items.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.payment_method || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(Number(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={4} className="font-semibold">
                      Subtotal - {category}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(categoryTotal)}
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
