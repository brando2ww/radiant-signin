import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

export const BalanceCard = ({ balance, className }: BalanceCardProps) => {
  const navigate = useNavigate();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 p-6 md:p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${className}`}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/30" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-yellow-500/20" />
      <div className="absolute right-20 -bottom-10 h-24 w-24 rounded-full bg-yellow-300/40" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-800/70 mb-1">Saldo Atual</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-900 tracking-tight">
            {formatCurrency(balance)}
          </h2>
        </div>
        
        <Button
          size="icon"
          onClick={() => navigate('/transactions')}
          className="h-12 w-12 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
