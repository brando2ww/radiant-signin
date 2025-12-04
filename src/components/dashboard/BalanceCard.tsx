import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

export const BalanceCard = ({ balance, className }: BalanceCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 via-yellow-200/80 to-yellow-300/60 p-6 md:p-8 shadow-lg transition-all duration-500 hover:shadow-glow-strong hover:scale-[1.01] backdrop-blur-sm ${className}`}
      style={{ 
        animation: 'fade-slide-in 0.6s ease-out forwards',
        opacity: 0 
      }}
    >
      {/* Animated decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-400/30 animate-pulse" />
      <div className="absolute -right-4 top-12 h-20 w-20 rounded-full bg-yellow-500/20" style={{ animation: 'float 3s ease-in-out infinite' }} />
      <div className="absolute right-20 -bottom-10 h-24 w-24 rounded-full bg-yellow-300/40" style={{ animation: 'float 4s ease-in-out infinite reverse' }} />
      <div className="absolute left-1/2 -bottom-16 h-40 w-40 rounded-full bg-gradient-to-t from-yellow-400/20 to-transparent blur-2xl" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-800/70 mb-1 uppercase tracking-wider">Saldo Atual</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-900 tracking-tight">
            R${' '}
            <CountUp
              end={balance}
              decimals={2}
              decimal=","
              separator="."
              duration={1.5}
              preserveValue
            />
          </h2>
          <p className="text-xs text-yellow-700/60 mt-2">Atualizado em tempo real</p>
        </div>
        
        <Button
          size="icon"
          onClick={() => navigate('/transactions')}
          className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-110 border-2 border-yellow-400/30"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};
