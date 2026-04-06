import { Star } from "lucide-react";

interface LoyaltyBannerProps {
  points: number;
  cashbackPerPoint: number;
}

export function LoyaltyBanner({ points, cashbackPerPoint }: LoyaltyBannerProps) {
  if (points <= 0) return null;

  const cashbackValue = (points * cashbackPerPoint).toFixed(2);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-sm">
      <Star className="h-4 w-4 text-primary fill-primary" />
      <span>
        Você tem <strong className="text-primary">{points} pontos</strong> (R$ {cashbackValue} em cashback)
      </span>
    </div>
  );
}
