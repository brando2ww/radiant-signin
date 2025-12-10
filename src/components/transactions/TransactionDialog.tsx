import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TransactionFormData } from '@/lib/validations/transaction';
import { Transaction } from '@/hooks/use-transactions';
import { TransactionWizard } from './wizard/TransactionWizard';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionFormData) => void;
  transaction?: Transaction | null;
  isSubmitting: boolean;
}

export const TransactionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  transaction,
  isSubmitting,
}: TransactionDialogProps) => {
  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <TransactionWizard
          transaction={transaction}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
