import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface CMVBadgeProps {
  cmv: number;
  price: number;
  showMargin?: boolean;
  variant?: "default" | "detailed";
}

export function CMVBadge({ cmv, price, showMargin = false, variant = "default" }: CMVBadgeProps) {
  const margin = price > 0 ? ((price - cmv) / price) * 100 : 0;
  const isNegativeMargin = margin < 0;
  const isLowMargin = margin < 30 && margin >= 0;
  const isGoodMargin = margin >= 30;

  if (variant === "detailed") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          CMV: R$ {cmv.toFixed(2)}
        </Badge>
        <Badge 
          variant={isNegativeMargin ? "destructive" : isLowMargin ? "secondary" : "default"}
          className="gap-1"
        >
          {isNegativeMargin && <TrendingDown className="h-3 w-3" />}
          {isLowMargin && <AlertTriangle className="h-3 w-3" />}
          {isGoodMargin && <TrendingUp className="h-3 w-3" />}
          {margin.toFixed(1)}%
        </Badge>
      </div>
    );
  }

  return (
    <Badge 
      variant={isNegativeMargin ? "destructive" : isLowMargin ? "secondary" : "outline"}
      className="font-mono"
    >
      CMV: R$ {cmv.toFixed(2)}
      {showMargin && ` (${margin.toFixed(0)}%)`}
    </Badge>
  );
}
