import { Banknote, CreditCard, Smartphone, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

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
      prefix: "",
    },
    {
      label: "Dinheiro",
      value: totalCash,
      icon: Banknote,
      prefix: "+",
    },
    {
      label: "Cartão",
      value: totalCard,
      icon: CreditCard,
      prefix: "",
    },
    {
      label: "PIX",
      value: totalPix,
      icon: Smartphone,
      prefix: "",
    },
    {
      label: "Sangrias",
      value: totalWithdrawals,
      icon: TrendingDown,
      prefix: "-",
    },
    {
      label: "Reforços",
      value: totalReinforcements,
      icon: TrendingUp,
      prefix: "+",
    },
  ];

  return (
    <div className="bg-muted/30 border rounded-lg p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {/* Cards menores de resumo */}
        {summaryItems.map((item) => (
          <Card key={item.label} className="border-0 shadow-none bg-background">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                  <item.icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {item.prefix && item.value > 0 ? item.prefix : ""}
                {formatBRL(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Card Total de Vendas */}
        <Card className="border shadow-none bg-muted/50">
          <CardContent className="p-2">
            <p className="text-xs text-muted-foreground mb-1">Total Vendas</p>
            <p className="text-base font-bold text-foreground">
              {formatBRL(totalSales)}
            </p>
          </CardContent>
        </Card>

        {/* Card Saldo Atual - Destaque */}
        <Card
          className={`border-2 shadow-sm bg-muted/50 ${
            isOpen ? "border-primary" : "border-muted-foreground/20"
          }`}
        >
          <CardContent className="p-2">
            <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
            <p className="text-lg font-bold text-foreground">
              {formatBRL(currentBalance)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
