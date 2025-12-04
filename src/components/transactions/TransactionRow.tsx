import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '@/hooks/use-transactions';
import { getCategoryIcon, getCategoryLabel } from '@/data/transaction-categories';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionRow = ({ transaction, onEdit, onDelete }: TransactionRowProps) => {
  const transactionType = transaction.type as 'income' | 'expense';
  const Icon = getCategoryIcon(transaction.category, transactionType);
  const categoryLabel = getCategoryLabel(transaction.category, transactionType);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        {format(new Date(transaction.transaction_date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          )}>
            <Icon className={cn(
              "h-4 w-4",
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            )} />
          </div>
          <span>{transaction.description}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{categoryLabel}</Badge>
      </TableCell>
      <TableCell className={cn(
        "font-semibold",
        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
      )}>
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(transaction)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
