import { Gift, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface PrizeResultProps {
  prizeName: string;
  couponCode: string;
  expiresAt: string;
}

export function PrizeResult({ prizeName, couponCode, expiresAt }: PrizeResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(expiresAt).toLocaleDateString("pt-BR");

  return (
    <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
        <Gift className="h-10 w-10 text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">🎉 Parabéns!</h2>
        <p className="text-lg text-foreground font-semibold">
          Você ganhou: <span className="text-primary">{prizeName}</span>
        </p>
      </div>

      <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-6 space-y-3 max-w-xs mx-auto">
        <p className="text-sm text-muted-foreground font-medium">Apresente este cupom no caixa:</p>
        <div className="flex items-center justify-center gap-2">
          <code className="text-3xl font-black tracking-wider text-primary">{couponCode}</code>
          <button onClick={handleCopy} className="p-2 hover:bg-muted rounded-lg transition-colors">
            {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Válido até: {formattedDate}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        📸 Tire um screenshot para não perder seu cupom!
      </p>
    </div>
  );
}
