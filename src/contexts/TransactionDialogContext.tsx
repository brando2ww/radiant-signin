import { createContext, useContext, useState, ReactNode } from 'react';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { useTransactions, Transaction } from '@/hooks/use-transactions';
import { TransactionFormData } from '@/lib/validations/transaction';
import { toast } from 'sonner';

interface TransactionDialogContextType {
  isOpen: boolean;
  openDialog: (transaction?: Transaction | null) => void;
  closeDialog: () => void;
}

const TransactionDialogContext = createContext<TransactionDialogContextType>({
  isOpen: false,
  openDialog: () => {},
  closeDialog: () => {},
});

export const useTransactionDialog = () => useContext(TransactionDialogContext);

interface TransactionDialogProviderProps {
  children: ReactNode;
}

export const TransactionDialogProvider = ({ children }: TransactionDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const { createTransaction, updateTransaction, isCreating, isUpdating } = useTransactions();

  const openDialog = (transaction?: Transaction | null) => {
    setSelectedTransaction(transaction || null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedTransaction(null);
  };

  const handleSubmit = (data: TransactionFormData) => {
    if (selectedTransaction) {
      updateTransaction(
        { id: selectedTransaction.id, data },
        {
          onSuccess: () => {
            toast.success('Transação atualizada com sucesso!');
            closeDialog();
          },
        }
      );
    } else {
      createTransaction(data, {
        onSuccess: () => {
          toast.success('Transação criada com sucesso!');
          closeDialog();
        },
      });
    }
  };

  return (
    <TransactionDialogContext.Provider
      value={{
        isOpen,
        openDialog,
        closeDialog,
      }}
    >
      {children}
      <TransactionDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onSubmit={handleSubmit}
        transaction={selectedTransaction}
        isSubmitting={isCreating || isUpdating}
      />
    </TransactionDialogContext.Provider>
  );
};
