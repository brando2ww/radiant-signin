import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star, Gift } from "lucide-react";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
}

interface LoyaltyRedeemSheetProps {
  points: number;
  minPointsRedeem: number;
  cashbackPerPoint: number;
  prizes: Prize[];
  onRedeemCashback: (pointsToUse: number) => void;
  onRedeemPrize: (prize: Prize) => void;
}

export function LoyaltyRedeemSheet({
  points,
  minPointsRedeem,
  cashbackPerPoint,
  prizes,
  onRedeemCashback,
  onRedeemPrize,
}: LoyaltyRedeemSheetProps) {
  const [cashbackPoints, setCashbackPoints] = useState("");
  const canRedeem = points >= minPointsRedeem;

  const maxCashbackValue = (points * cashbackPerPoint).toFixed(2);
  const currentCashback = cashbackPoints ? (parseInt(cashbackPoints) * cashbackPerPoint).toFixed(2) : "0.00";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!canRedeem}>
          <Star className="h-4 w-4" />
          Usar {points} pontos
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-primary" />
            Resgatar Pontos ({points} disponíveis)
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Cashback */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Cashback (desconto no pedido)</h4>
            <p className="text-xs text-muted-foreground">
              Máximo: {points} pontos = R$ {maxCashbackValue}
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>Quantos pontos usar?</Label>
                <Input
                  type="number"
                  min={minPointsRedeem}
                  max={points}
                  value={cashbackPoints}
                  onChange={(e) => setCashbackPoints(e.target.value)}
                  placeholder={`Mín: ${minPointsRedeem}`}
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">-R$ {currentCashback}</p>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={!cashbackPoints || parseInt(cashbackPoints) < minPointsRedeem || parseInt(cashbackPoints) > points}
              onClick={() => onRedeemCashback(parseInt(cashbackPoints))}
            >
              Aplicar Cashback
            </Button>
          </div>

          {prizes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Prêmios disponíveis</h4>
                <div className="space-y-2">
                  {prizes.map((prize) => (
                    <div key={prize.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{prize.name}</p>
                          {prize.description && <p className="text-xs text-muted-foreground">{prize.description}</p>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={points < prize.points_cost}
                        onClick={() => onRedeemPrize(prize)}
                      >
                        {prize.points_cost} pts
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
