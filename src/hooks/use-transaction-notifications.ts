import { useSettings } from "./use-settings";
import { toast } from "sonner";

export function useTransactionNotifications() {
  const { settings } = useSettings();

  const notifyNewIncome = (amount: number, description?: string) => {
    if (settings?.notifications?.transactions?.new_income) {
      toast.success("💰 Nova receita registrada!", {
        description: description
          ? `${description} - R$ ${amount.toFixed(2)}`
          : `R$ ${amount.toFixed(2)}`,
      });
    }
  };

  const notifyNewExpense = (amount: number, description?: string) => {
    if (settings?.notifications?.transactions?.new_expense) {
      toast.info("💸 Nova despesa registrada!", {
        description: description
          ? `${description} - R$ ${amount.toFixed(2)}`
          : `R$ ${amount.toFixed(2)}`,
      });
    }
  };

  const notifyTransactionEdited = (description?: string) => {
    if (settings?.notifications?.transactions?.edited) {
      toast.info("✏️ Transação editada", {
        description: description || "Uma transação foi modificada",
      });
    }
  };

  const notifyTransactionDeleted = (description?: string) => {
    if (settings?.notifications?.transactions?.edited) {
      toast.info("🗑️ Transação removida", {
        description: description || "Uma transação foi excluída",
      });
    }
  };

  return {
    notifyNewIncome,
    notifyNewExpense,
    notifyTransactionEdited,
    notifyTransactionDeleted,
  };
}
