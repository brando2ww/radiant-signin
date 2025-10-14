import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard } from '@/hooks/use-credit-cards';
import { CurrentInvoiceTab } from './CurrentInvoiceTab';
import { getBrandLabel } from '@/data/card-brands';

interface CreditCardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CreditCard | null;
}

export function CreditCardDetailsDialog({ 
  open, 
  onOpenChange, 
  card 
}: CreditCardDetailsDialogProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{card.name}</span>
            <span className="text-muted-foreground text-base font-normal">
              •••• {card.last_four_digits || '****'}
            </span>
            <span className="text-sm text-muted-foreground font-normal">
              ({getBrandLabel(card.brand || '')})
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="invoice" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">Fatura Atual</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="space-y-4">
            <CurrentInvoiceTab card={card} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Configurações do cartão em desenvolvimento.</p>
              <p className="text-sm mt-2">Use o botão "Editar" no card do cartão para alterar os dados.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
