import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/hooks/use-transactions';
import { FileText, Edit, Trash, TrendingUp, TrendingDown, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { incomeCategories, expenseCategories } from '@/data/transaction-categories';
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
      <Card className="glass-bg border-border/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-bg border-border/20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
          <p className="text-muted-foreground text-center mb-4">
            Comece adicionando sua primeira transação.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="glass-bg border-border/20 animate-fade-in">
            <CardContent className="p-5">
              <div className="space-y-4">
                {/* Header with date and amount */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <p className="text-xs text-muted-foreground font-medium">
                      {format(new Date(transaction.transaction_date + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <h3 className="font-semibold text-lg leading-tight">
                      {transaction.description}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      "text-xl font-bold",
                      transaction.type === 'income' ? "text-green-600" : "text-destructive"
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/20 my-4"></div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(transaction.type, transaction.category)}
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant="outline" className="text-xs">
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <div className="flex gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop layout
  return (
    <Card className="glass-bg border-border/20 animate-fade-in">
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
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="group flex items-center justify-between p-4 border border-border/20 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-full transition-transform group-hover:scale-110",
                  transaction.type === 'income' 
                    ? "bg-green-500/10 text-green-500"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    transaction.type === 'income' ? "text-green-600" : "text-destructive"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
