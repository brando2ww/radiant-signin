import { Unlock, Lock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CashierActionsSidebarProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenCashier: () => void;
  onCloseCashier: () => void;
  onAddReinforcement: () => void;
  onAddWithdrawal: () => void;
}

export function CashierActionsSidebar({
  isOpen,
  isLoading,
  onOpenCashier,
  onCloseCashier,
  onAddReinforcement,
  onAddWithdrawal,
}: CashierActionsSidebarProps) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Ações Rápidas
      </h3>

      {!isOpen ? (
        <Button
          onClick={onOpenCashier}
          disabled={isLoading}
          className="h-20 flex-col gap-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Unlock className="h-6 w-6" />
          <span className="text-sm font-medium">Abrir Caixa</span>
          <kbd className="text-[10px] opacity-70 bg-black/20 px-1.5 py-0.5 rounded">F1</kbd>
        </Button>
      ) : (
        <>
          <Button
            onClick={onAddReinforcement}
            disabled={isLoading}
            variant="outline"
            className="h-20 flex-col gap-1 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
          >
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Reforço</span>
            <kbd className="text-[10px] opacity-50 bg-muted px-1.5 py-0.5 rounded">F2</kbd>
          </Button>

          <Button
            onClick={onAddWithdrawal}
            disabled={isLoading}
            variant="outline"
            className="h-20 flex-col gap-1 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50"
          >
            <TrendingDown className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium">Sangria</span>
            <kbd className="text-[10px] opacity-50 bg-muted px-1.5 py-0.5 rounded">F3</kbd>
          </Button>

          <div className="flex-1" />

          <Button
            onClick={onCloseCashier}
            disabled={isLoading}
            variant="destructive"
            className="h-20 flex-col gap-1"
          >
            <Lock className="h-6 w-6" />
            <span className="text-sm font-medium">Fechar Caixa</span>
            <kbd className="text-[10px] opacity-70 bg-black/20 px-1.5 py-0.5 rounded">F4</kbd>
          </Button>
        </>
      )}
    </div>
  );
}
