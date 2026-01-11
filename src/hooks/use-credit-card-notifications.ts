import { useSettings } from "./use-settings";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface CreditCard {
  id: string;
  name: string;
  current_balance?: number | null;
  credit_limit?: number | null;
}

export function useCreditCardNotifications(cards: CreditCard[]) {
  const { settings } = useSettings();
  const notifiedCards = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings?.notifications?.credit_cards?.limit_percentage) return;
    if (!cards || cards.length === 0) return;

    const threshold = settings.notifications.credit_cards.limit_percentage;

    cards.forEach((card) => {
      if (!card.current_balance || !card.credit_limit || card.credit_limit === 0) return;

      const usage = (card.current_balance / card.credit_limit) * 100;

      // Only notify once per card per session
      if (usage >= threshold && !notifiedCards.current.has(card.id)) {
        notifiedCards.current.add(card.id);
        toast.warning(`⚠️ Cartão ${card.name} atingiu ${usage.toFixed(0)}% do limite`, {
          description: `Limite: R$ ${card.credit_limit.toFixed(2)} | Usado: R$ ${card.current_balance.toFixed(2)}`,
        });
      }
    });
  }, [cards, settings?.notifications?.credit_cards?.limit_percentage]);

  const notifyNewCardTransaction = (cardName: string, amount: number, description?: string) => {
    // Uses invoice_closed as a general notification toggle for card events
    if (settings?.notifications?.credit_cards?.invoice_closed) {
      toast.info(`💳 Nova transação no ${cardName}`, {
        description: description
          ? `${description} - R$ ${amount.toFixed(2)}`
          : `R$ ${amount.toFixed(2)}`,
      });
    }
  };

  const notifyInvoiceDueSoon = (cardName: string, dueDate: string, amount: number) => {
    if (settings?.notifications?.credit_cards?.due_date_days) {
      toast.warning(`📅 Fatura do ${cardName} vence em breve`, {
        description: `Vencimento: ${dueDate} | Valor: R$ ${amount.toFixed(2)}`,
      });
    }
  };

  const notifyInvoiceClosed = (cardName: string, amount: number) => {
    if (settings?.notifications?.credit_cards?.invoice_closed) {
      toast.info(`📋 Fatura do ${cardName} fechada`, {
        description: `Valor total: R$ ${amount.toFixed(2)}`,
      });
    }
  };

  return {
    notifyNewCardTransaction,
    notifyInvoiceDueSoon,
    notifyInvoiceClosed,
  };
}
