import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] rounded-t-[20px]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6">
          <TransactionWizard
            transaction={transaction}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
