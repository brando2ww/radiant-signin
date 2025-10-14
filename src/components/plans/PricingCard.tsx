import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plan } from "@/data/plans";
import { FeaturesList } from "./FeaturesList";
import { Flame } from "lucide-react";

interface PricingCardProps {
  plan: Plan;
  isYearly: boolean;
  onSelect: (planId: string) => void;
  index: number;
}

export function PricingCard({ plan, isYearly, onSelect, index }: PricingCardProps) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const totalYearly = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice * 12;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in ${
        plan.isPopular
          ? "border-2 border-primary shadow-xl"
          : "hover:border-primary/50"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {plan.isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg flex items-center gap-1">
          <Flame className="h-4 w-4" />
          <span className="text-xs font-bold">MAIS POPULAR</span>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              R$ {price}
            </span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          {isYearly && price > 0 && (
            <p className="text-sm text-muted-foreground">
              R$ {totalYearly}/ano • Economize R$ {(plan.monthlyPrice * 12) - totalYearly}
            </p>
          )}
        </div>

        <FeaturesList features={plan.features} />
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelect(plan.id)}
          variant={plan.isPopular ? "default" : "outline"}
          className="w-full transition-all hover:scale-105"
          size="lg"
        >
          {plan.buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
