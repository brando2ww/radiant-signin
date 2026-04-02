import { Gift, Copy, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface PrizeResultProps {
  prizeName: string;
  couponCode: string;
  expiresAt: string;
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2.5 + Math.random() * 2;
        const size = 6 + Math.random() * 6;
        const colors = [
          "hsl(var(--primary))",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#06b6d4",
        ];
        const color = colors[i % colors.length];
        const rotate = Math.random() * 360;

        return (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${left}%`,
              top: "-10px",
              width: `${size}px`,
              height: `${size * 0.6}px`,
              backgroundColor: color,
              opacity: 0.9,
              transform: `rotate(${rotate}deg)`,
              animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { 
            transform: translateY(0) rotate(0deg) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh) rotate(720deg) scale(0.3); 
            opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
}

export function PrizeResult({ prizeName, couponCode, expiresAt }: PrizeResultProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(expiresAt).toLocaleDateString("pt-BR");

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 shadow-lg shadow-green-500/10">
          <Gift className="h-10 w-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">🎉 Parabéns!</h2>
          <p className="text-lg text-foreground font-medium">
            Você ganhou: <span className="text-primary font-bold">{prizeName}</span>
          </p>
        </div>

        <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-2 border-dashed border-primary/40 rounded-2xl p-6 space-y-3 max-w-xs mx-auto shadow-lg shadow-primary/5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Seu cupom</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-3xl font-black tracking-wider text-primary">{couponCode}</code>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-muted/50 rounded-xl transition-all duration-200 active:scale-90"
            >
              {copied ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Válido até: {formattedDate}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          📸 Tire um screenshot para não perder seu cupom!
        </p>
      </div>
    </>
  );
}
