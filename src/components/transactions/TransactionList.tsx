import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/hooks/use-transactions';
import { FileText, Edit, Trash, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { incomeCategories, expenseCategories, getCategoryIcon } from '@/data/transaction-categories';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, isLoading, onEdit, onDelete }: TransactionListProps) => {
  const isMobile = useIsMobile();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (type: string, category: string) => {
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    return categories.find(c => c.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma transação</h3>
          <p className="text-muted-foreground text-center text-sm">
            Adicione sua primeira transação para começar.
          </p>
        </div>
      </div>
    );
  }

  // Mobile layout - Modern cards
  if (isMobile) {
    return (
      <div className="space-y-3 w-full overflow-hidden">
        {transactions.map((transaction, index) => {
          const CategoryIcon = getCategoryIcon(transaction.category, transaction.type as 'income' | 'expense');
          
          return (
            <div 
              key={transaction.id} 
              className="bg-card rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
              onClick={() => onEdit(transaction)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
            <div className="flex items-center gap-3 w-full overflow-hidden">
                {/* Circular Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  transaction.type === 'income' 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-red-100 dark:bg-red-900/30"
                )}>
                  {transaction.type === 'income' ? (
                    <ArrowDownLeft className={cn(
                      "w-5 h-5",
                      "text-green-600 dark:text-green-400"
                    )} />
                  ) : (
                    <ArrowUpRight className={cn(
                      "w-5 h-5",
                      "text-red-600 dark:text-red-400"
                    )} />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <CategoryIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{getCategoryLabel(transaction.type, transaction.category)}</span>
                  </div>
                </div>
                
                {/* Amount and Date */}
                <div className="text-right shrink-0 max-w-[110px]">
                  <p className={cn(
                    "font-semibold text-sm truncate",
                    transaction.type === 'income' 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {transaction.type === 'income' ? '+' : '−'} {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(transaction.transaction_date + 'T12:00:00'), 'dd.MM.yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop layout
  return (
    <Card className="border-border/40 shadow-sm animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transações
            </CardTitle>
            <CardDescription>
              Visualize todas as suas transações em um só lugar
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {transactions.length} transações
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {transactions.map((transaction) => {
            const CategoryIcon = getCategoryIcon(transaction.category, transaction.type as 'income' | 'expense');
            
            return (
              <div
                key={transaction.id}
                className="group flex items-center justify-between p-4 border border-border/20 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    transaction.type === 'income' 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span>{getCategoryLabel(transaction.type, transaction.category)}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.transaction_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold text-lg",
                      transaction.type === 'income' 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {transaction.type === 'income' ? '+' : '−'} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(transaction)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(transaction)}
                      className="h-8 w-8 p-0 hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
