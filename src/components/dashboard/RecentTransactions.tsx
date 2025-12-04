import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Home, Car, Utensils, Smartphone, Heart, Briefcase, CreditCard, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Compras': <ShoppingBag className="h-4 w-4" />,
    'Moradia': <Home className="h-4 w-4" />,
    'Transporte': <Car className="h-4 w-4" />,
    'Alimentação': <Utensils className="h-4 w-4" />,
    'Tecnologia': <Smartphone className="h-4 w-4" />,
    'Saúde': <Heart className="h-4 w-4" />,
    'Trabalho': <Briefcase className="h-4 w-4" />,
    'Serviços': <CreditCard className="h-4 w-4" />,
  };
  return icons[category] || <MoreHorizontal className="h-4 w-4" />;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Compras': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    'Moradia': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'Transporte': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    'Alimentação': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'Tecnologia': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'Saúde': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    'Trabalho': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Serviços': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  };
  return colors[category] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

export const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateStr: string) => { try { return format(new Date(dateStr), "dd MMM, HH:mm", { locale: ptBR }); } catch { return dateStr; } };

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm" style={{ animation: 'fade-slide-in 0.5s ease-out 300ms forwards', opacity: 0 }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"><CreditCard className="h-4 w-4" /></div>
            Transações Recentes
          </span>
          <Link to="/transactions" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">Ver todas <ArrowRight className="h-4 w-4" /></Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center"><CreditCard className="h-6 w-6 text-muted-foreground/50" /></div>
              <p className="text-sm text-muted-foreground">Nenhuma transação recente</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group cursor-pointer" style={{ animation: `fade-slide-in 0.3s ease-out ${400 + index * 50}ms forwards`, opacity: 0 }}>
                <div className={`p-2.5 rounded-xl ${getCategoryColor(transaction.category)} group-hover:scale-110 transition-transform duration-200`}>{getCategoryIcon(transaction.category)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{transaction.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
                <p className={`font-bold text-sm ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
