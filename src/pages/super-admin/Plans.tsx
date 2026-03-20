import { PLANS } from "@/data/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export default function Plans() {
  const plans = Object.values(PLANS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground text-sm">
          Planos disponíveis na plataforma
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.isPopular ? "border-primary shadow-md" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.isPopular && (
                  <Badge variant="default" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2">
                <span className="text-3xl font-bold tabular-nums">
                  R$ {plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              {plan.yearlyPrice !== plan.monthlyPrice && (
                <p className="text-xs text-muted-foreground">
                  ou R$ {plan.yearlyPrice}/mês no plano anual
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground/60"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
