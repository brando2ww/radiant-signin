import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, MoreVertical, CreditCard, Zap, Home, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  type: 'payable' | 'receivable';
  status: string;
  category?: string;
}

interface UpcomingBillsProps {
  bills: Bill[];
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
      return <ShoppingBag className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

export const UpcomingBills = ({ bills }: UpcomingBillsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    return differenceInDays(dueDate, new Date());
  };

  return (
    <Card 
      className="rounded-2xl border-border/50 shadow-sm overflow-hidden"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out forwards',
        animationDelay: '300ms',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Próximos Pagamentos</span>
          <Link 
            to="/transactions" 
            className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Horizontal scroll container */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {bills.length === 0 ? (
            <div className="flex-1 text-center py-8 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma conta próxima</p>
            </div>
          ) : (
            bills.slice(0, 5).map((bill, index) => {
              const daysUntil = getDaysUntilDue(bill.dueDate);
              const isFirst = index === 0;
              
              return (
                <div
                  key={bill.id}
                  className={`flex-shrink-0 w-[180px] md:w-[200px] p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    isFirst 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg shadow-yellow-200' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${
                      isFirst ? 'bg-white/20' : 'bg-yellow-100'
                    }`}>
                      <span className={isFirst ? 'text-white' : 'text-yellow-600'}>
                        {getCategoryIcon(bill.category)}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${isFirst ? 'hover:bg-white/20 text-white' : 'hover:bg-muted'}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className={`text-xs font-medium mb-1 ${isFirst ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {bill.title}
                  </p>
                  <p className={`text-lg font-bold mb-2 ${isFirst ? 'text-white' : 'text-foreground'}`}>
                    {bill.type === 'receivable' ? '+' : ''}{formatCurrency(bill.amount)}
                  </p>
                  
                  <Badge 
                    variant={isFirst ? 'secondary' : 'outline'}
                    className={`text-xs ${
                      isFirst 
                        ? 'bg-white/20 text-white border-0 hover:bg-white/30' 
                        : daysUntil < 0 
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : daysUntil <= 3
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {daysUntil === 0 
                      ? 'Hoje' 
                      : daysUntil < 0 
                        ? `${Math.abs(daysUntil)}d atrasado` 
                        : `${daysUntil} dias`}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
