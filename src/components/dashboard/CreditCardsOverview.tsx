import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, ArrowRight, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

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

export const CreditCardsOverview = ({ cards }: CreditCardsOverviewProps) => {
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

  const getBrandLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MC';
      case 'elo':
        return 'ELO';
      default:
        return brand.substring(0, 3).toUpperCase();
    }
  };

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 900ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            Cartões de Crédito
          </span>
          <Link to="/credit-cards" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
          {cards.map((card, index) => {
            const daysUntil = getDaysUntilDue(card.dueDay);
            const usagePercentage = (card.currentBalance / card.creditLimit) * 100;
            
            return (
              <div
                key={card.id}
                className="flex-shrink-0 w-52 snap-start group"
                style={{ 
                  animationDelay: `${1000 + index * 100}ms`
                }}
              >
                {/* 3D Card Effect */}
                <div 
                  className="relative h-32 rounded-2xl p-4 text-white overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer"
                  style={{ 
                    background: `linear-gradient(135deg, ${card.color}, ${card.color}dd, ${card.color}aa)`,
                    boxShadow: `0 10px 30px -10px ${card.color}80`
                  }}
                >
                  {/* Decorative elements */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-white/5" />
                  
                  {/* Chip */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                      <div className="w-6 h-4 rounded-sm bg-yellow-600/30" />
                    </div>
                    <Wifi className="h-4 w-4 text-white/70 rotate-90" />
                  </div>
                  
                  {/* Card Number */}
                  <p className="text-xs text-white/70 tracking-widest mt-2">
                    •••• •••• •••• {card.lastFourDigits || '****'}
                  </p>
                  
                  {/* Footer */}
                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/60 uppercase">Fatura</p>
                      <p className="text-sm font-bold">
                        <CountUp end={card.currentBalance} decimals={0} separator="." prefix="R$ " duration={1} />
                      </p>
                    </div>
                    <span className="text-sm font-bold tracking-widest">{getBrandLogo(card.brand)}</span>
                  </div>
                </div>
                
                {/* Card Info Below */}
                <div className="mt-3 px-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-foreground truncate">{card.name}</p>
                    {daysUntil <= 5 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                        {daysUntil}d
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usagePercentage.toFixed(0)}% usado • Venc. dia {card.dueDay}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Add Card Button */}
          <Link to="/credit-cards" className="flex-shrink-0 w-52 snap-start">
            <div className="h-32 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-yellow-500/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group">
              <div className="p-3 rounded-full bg-muted/50 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-yellow-600">Adicionar Cartão</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
