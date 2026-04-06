import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeliveryFunnel } from "@/hooks/use-delivery-funnel";
import { Eye, ShoppingCart, CheckCircle2, TrendingDown, Loader2 } from "lucide-react";

interface PurchaseFunnelProps {
  userId: string;
  startDate: Date;
  endDate: Date;
}

export const PurchaseFunnel = ({ userId, startDate, endDate }: PurchaseFunnelProps) => {
  const { data, isLoading } = useDeliveryFunnel(userId, startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const steps = [
    {
      label: "Visualizaram o cardápio",
      value: data.pageViews,
      icon: Eye,
      color: "from-blue-500 to-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-600 dark:text-blue-400",
      widthPercent: 100,
    },
    {
      label: "Adicionaram ao carrinho",
      value: data.addToCarts,
      icon: ShoppingCart,
      color: "from-amber-500 to-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      textColor: "text-amber-600 dark:text-amber-400",
      widthPercent: data.pageViews > 0 ? Math.max((data.addToCarts / data.pageViews) * 100, 20) : 20,
    },
    {
      label: "Converteram (compraram)",
      value: data.purchases,
      icon: CheckCircle2,
      color: "from-green-500 to-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      textColor: "text-green-600 dark:text-green-400",
      widthPercent: data.pageViews > 0 ? Math.max((data.purchases / data.pageViews) * 100, 10) : 10,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Funil de Compra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Funnel Visual */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const prevValue = index > 0 ? steps[index - 1].value : null;
              const dropRate = prevValue && prevValue > 0
                ? (((prevValue - step.value) / prevValue) * 100).toFixed(1)
                : null;

              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${step.textColor}`} />
                      <span className="font-medium">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {dropRate && (
                        <span className="text-xs text-muted-foreground">
                          -{dropRate}% de perda
                        </span>
                      )}
                      <span className="font-bold text-lg">{step.value}</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8 overflow-hidden flex items-center justify-center">
                    <div
                      className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-500 flex items-center justify-center`}
                      style={{ width: `${step.widthPercent}%`, minWidth: "60px" }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {data.pageViews > 0
                          ? `${((step.value / data.pageViews) * 100).toFixed(1)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Visualização → Carrinho</p>
            <p className="text-2xl font-bold">{data.viewToCartRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Carrinho → Compra</p>
            <p className="text-2xl font-bold">{data.cartToPurchaseRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Conversão Geral</p>
            <p className="text-2xl font-bold text-primary">{data.overallConversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
