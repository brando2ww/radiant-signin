import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
interface CreditCardData {
  id: string;
  name: string;
  brand: string;
  currentBalance: number;
  creditLimit: number;
  dueDay: number;
  color: string;
  lastFourDigits?: string;
}
interface CreditCardsOverviewProps {
  cards: CreditCardData[];
}
export const CreditCardsOverview = ({
  cards
}: CreditCardsOverviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysUntil = dueDay - currentDay;
    if (daysUntil < 0) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
      return Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return daysUntil;
  };
  return <Card className="col-span-full animate-fade-in" style={{
    animationDelay: '800ms'
  }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">Cartões de Crédito</span>
          <Link to="/credit-cards" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map(card => {
          const daysUntil = getDaysUntilDue(card.dueDay);
          const usagePercentage = card.currentBalance / card.creditLimit * 100;
          return <div key={card.id} className="p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer" style={{
            borderColor: card.color
          }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      •••• {card.lastFourDigits || '****'}
                    </p>
                  </div>
                  <CreditCard className="h-5 w-5" style={{
                color: card.color
              }} />
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Fatura Atual</p>
                    <p className="text-lg font-bold">{formatCurrency(card.currentBalance)}</p>
                    <p className="text-xs text-muted-foreground">
                      de {formatCurrency(card.creditLimit)} ({usagePercentage.toFixed(0)}%)
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Vencimento</p>
                      {daysUntil <= 5 && <Badge variant="destructive" className="text-xs">
                          {daysUntil}d
                        </Badge>}
                    </div>
                    <p className="text-sm font-medium">Dia {card.dueDay}</p>
                  </div>
                </div>
              </div>;
        })}
          
          <Link to="/credit-cards">
            <div className="h-full min-h-[160px] p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-accent transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
              <Plus className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Adicionar Cartão</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>;
};