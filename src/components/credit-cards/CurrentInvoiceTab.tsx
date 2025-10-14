import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { CreditCard } from '@/hooks/use-credit-cards';
import { useCardTransactions } from '@/hooks/use-card-transactions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CurrentInvoiceTabProps {
  card: CreditCard;
}

export function CurrentInvoiceTab({ card }: CurrentInvoiceTabProps) {
  const { invoiceData, isLoading } = useCardTransactions(card);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoiceData) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum dado disponível</div>;
  }

  const limitUsage = ((card.current_balance || 0) / (card.credit_limit || 1)) * 100;
  const available = (card.credit_limit || 0) - (card.current_balance || 0);
  const daysUntilDue = getDaysUntilDue(invoiceData.dueDate);

  return (
    <div className="space-y-6">
      {/* Resumo da Fatura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo da Fatura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Período</p>
              <p className="font-medium">
                {formatDate(invoiceData.periodStart)} - {formatDate(invoiceData.periodEnd)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vencimento</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(invoiceData.dueDate)}</p>
                {daysUntilDue <= 5 && (
                  <Badge variant="destructive" className="ml-2">
                    {daysUntilDue}d
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fatura Atual</span>
              <span className="font-bold text-lg">{formatCurrency(card.current_balance || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Limite Total</span>
              <span className="font-semibold">{formatCurrency(card.credit_limit || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Disponível</span>
              <span className="font-semibold text-green-600">{formatCurrency(available)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Limite Utilizado</span>
              <span className="font-medium">{limitUsage.toFixed(1)}%</span>
            </div>
            <Progress value={limitUsage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lançamentos do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceData.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma transação neste período</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoiceData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-destructive">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
