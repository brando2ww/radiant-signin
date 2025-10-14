import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const getBadgeVariant = (daysUntil: number) => {
    if (daysUntil < 0) return 'destructive';
    if (daysUntil <= 3) return 'default';
    return 'secondary';
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🏦 Contas Próximas
          </span>
          <Link to="/transactions" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conta próxima</p>
            </div>
          ) : (
            bills.slice(0, 4).map((bill) => {
              const daysUntil = getDaysUntilDue(bill.dueDate);
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{bill.title}</p>
                      <Badge variant={getBadgeVariant(daysUntil)} className="text-xs">
                        {daysUntil === 0 ? 'Hoje' : 
                         daysUntil < 0 ? `${Math.abs(daysUntil)}d atrasado` :
                         `${daysUntil}d`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(bill.dueDate, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <p className={`font-semibold ${bill.type === 'receivable' ? 'text-green-600' : 'text-foreground'}`}>
                    {bill.type === 'receivable' ? '+' : ''}{formatCurrency(bill.amount)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
