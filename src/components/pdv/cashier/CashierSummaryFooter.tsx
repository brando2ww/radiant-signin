import { Banknote, CreditCard, Smartphone, TrendingDown, TrendingUp, Wallet } from "lucide-react";

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

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

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
  const items = [
    { label: "Abertura", value: openingBalance, icon: Wallet, sign: "" as const },
    { label: "Dinheiro", value: totalCash, icon: Banknote, sign: "+" as const },
    { label: "Cartão", value: totalCard, icon: CreditCard, sign: "" as const },
    { label: "PIX", value: totalPix, icon: Smartphone, sign: "" as const },
    { label: "Sangrias", value: totalWithdrawals, icon: TrendingDown, sign: "-" as const },
    { label: "Reforços", value: totalReinforcements, icon: TrendingUp, sign: "+" as const },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Saldo Atual - destaque principal */}
      <div
        className={`rounded-md border-2 p-3 ${
          isOpen ? "border-primary bg-primary/5" : "border-muted-foreground/20 bg-muted/30"
        }`}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo Atual</p>
        <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
          {formatBRL(currentBalance)}
        </p>
      </div>

      {/* Total de Vendas - destaque secundário */}
      <div className="mt-2 rounded-md border bg-muted/40 p-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Vendas</p>
        <p className="text-lg font-semibold text-foreground mt-0.5 tabular-nums">
          {formatBRL(totalSales)}
        </p>
      </div>

      {/* Lista compacta de movimentações */}
      <div className="mt-3 pt-3 border-t space-y-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 px-1 py-1 rounded hover:bg-muted/40"
          >
            <div className="flex items-center gap-2 min-w-0">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{item.label}</span>
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums shrink-0">
              {item.sign && item.value > 0 ? item.sign : ""}
              {formatBRL(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
