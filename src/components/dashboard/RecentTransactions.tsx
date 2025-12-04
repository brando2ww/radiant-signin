import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Zap, Home, CreditCard, TrendingUp, Car, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  category?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'energia':
    case 'utilities':
      return <Zap className="h-4 w-4" />;
    case 'moradia':
    case 'aluguel':
      return <Home className="h-4 w-4" />;
    case 'compras':
    case 'shopping':
      return <ShoppingBag className="h-4 w-4" />;
    case 'transporte':
      return <Car className="h-4 w-4" />;
    case 'alimentação':
    case 'food':
      return <Utensils className="h-4 w-4" />;
    case 'receita':
    case 'income':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const getCategoryColor = (category?: string, type?: string) => {
  if (type === 'income') return 'bg-emerald-100 text-emerald-600';
  
  switch (category?.toLowerCase()) {
    case 'energia':
    case 'utilities':
      return 'bg-amber-100 text-amber-600';
    case 'moradia':
    case 'aluguel':
      return 'bg-blue-100 text-blue-600';
    case 'compras':
    case 'shopping':
      return 'bg-purple-100 text-purple-600';
    case 'transporte':
      return 'bg-cyan-100 text-cyan-600';
    case 'alimentação':
    case 'food':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card 
      className="rounded-2xl border-border/50 shadow-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out forwards',
        animationDelay: '400ms',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Transações Recentes</span>
          <Link 
            to="/transactions" 
            className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma transação recente</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`p-2.5 rounded-xl ${getCategoryColor(transaction.category, transaction.type)}`}>
                  {getCategoryIcon(transaction.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {transaction.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(transaction.date, "dd MMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                
                <p className={`font-semibold text-sm ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-foreground'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
