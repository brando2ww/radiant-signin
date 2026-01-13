import { Banknote, CreditCard, Smartphone, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CashierSummaryFooterProps {
  openingBalance: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  totalWithdrawals: number;
  totalReinforcements: number;
  totalSales: number;
  currentBalance: number;
  isOpen: boolean;
}

export function CashierSummaryFooter({
  openingBalance,
  totalCash,
  totalCard,
  totalPix,
  totalWithdrawals,
  totalReinforcements,
  totalSales,
  currentBalance,
  isOpen,
}: CashierSummaryFooterProps) {
  const summaryItems = [
    {
      label: "Abertura",
      value: openingBalance,
      icon: Wallet,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Dinheiro",
      value: totalCash,
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      prefix: "+",
    },
    {
      label: "Cartão",
      value: totalCard,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "PIX",
      value: totalPix,
      icon: Smartphone,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Sangrias",
      value: totalWithdrawals,
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      prefix: "-",
    },
    {
      label: "Reforços",
      value: totalReinforcements,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      prefix: "+",
    },
  ];

  return (
    <div className="bg-muted/30 border rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Cards menores de resumo */}
        {summaryItems.map((item) => (
          <Card key={item.label} className="border-0 shadow-none bg-background">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-6 w-6 rounded ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className={`text-sm font-semibold ${item.color}`}>
                {item.prefix && item.value > 0 ? item.prefix : ""}
                R$ {item.value.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Card Total de Vendas */}
        <Card className="border-0 shadow-none bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Vendas</p>
            <p className="text-lg font-bold text-primary">
              R$ {totalSales.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Card Saldo Atual - Destaque */}
        <Card
          className={`border-2 shadow-sm ${
            isOpen
              ? "bg-green-500/10 border-green-500/30"
              : "bg-muted border-muted-foreground/20"
          }`}
        >
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
            <p
              className={`text-xl font-bold ${
                isOpen ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              R$ {currentBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
