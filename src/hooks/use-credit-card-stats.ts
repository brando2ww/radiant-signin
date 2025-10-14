import { useMemo } from 'react';
import { CreditCard } from './use-credit-cards';

export const useCreditCardStats = (cards: CreditCard[]) => {
  const stats = useMemo(() => {
    const activeCards = cards.filter(c => c.is_active);
    const totalInvoices = activeCards.reduce(
      (sum, card) => sum + (card.current_balance || 0),
      0
    );
    
    const today = new Date();
    const alerts = activeCards.filter(card => {
      const dueDay = card.due_day || 10;
      const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const limitUsage = ((card.current_balance || 0) / (card.credit_limit || 1)) * 100;
      
      return daysUntilDue <= 5 || limitUsage > 80;
    }).length;

    return {
      totalCards: activeCards.length,
      totalInvoices,
      alerts,
    };
  }, [cards]);

  return stats;
};
