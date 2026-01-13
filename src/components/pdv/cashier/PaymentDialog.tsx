import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { usePDVPayments, PaymentMethod } from "@/hooks/use-pdv-payments";
import { CurrencyInput } from "@/components/ui/currency-input";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // For single comanda
  comanda?: Comanda | null;
  items?: ComandaItem[];
  // For table payment
  table?: PDVTable | null;
  tableComandas?: Comanda[];
  tableItems?: ComandaItem[];
  onSuccess?: () => void;
}

const paymentMethods = [
  { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote },
  { id: "cartao" as PaymentMethod, label: "Cartão", icon: CreditCard },
  { id: "pix" as PaymentMethod, label: "PIX", icon: QrCode },
];

export function PaymentDialog({
  open,
  onOpenChange,
  comanda,
  items = [],
  table,
  tableComandas = [],
  tableItems = [],
  onSuccess,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("dinheiro");
  const [cashReceived, setCashReceived] = useState("");
  const [installments, setInstallments] = useState("1");
  
  const { registerPayment, isRegisteringPayment, registerTablePayment, isRegisteringTablePayment } = usePDVPayments();

  // Determine if we're paying for a table or single comanda
  const isTablePayment = !!table;
  const displayItems = isTablePayment ? tableItems : items;
  const total = isTablePayment
    ? tableComandas.reduce((sum, c) => sum + c.subtotal, 0)
    : comanda?.subtotal || 0;

  const title = isTablePayment
    ? `Mesa ${table?.table_number}`
    : `Comanda #${comanda?.comanda_number}`;

  // Calculate change
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = selectedMethod === "dinheiro" ? Math.max(0, cashReceivedNum - total) : 0;
  const canSubmit = selectedMethod !== "dinheiro" || cashReceivedNum >= total;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMethod("dinheiro");
      setCashReceived("");
      setInstallments("1");
    }
  }, [open]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async () => {
    try {
      if (isTablePayment && table) {
        await registerTablePayment({
          tableId: table.id,
          comandaIds: tableComandas.map((c) => c.id),
          amount: total,
          paymentMethod: selectedMethod,
          cashReceived: selectedMethod === "dinheiro" ? cashReceivedNum : undefined,
          changeAmount: selectedMethod === "dinheiro" ? changeAmount : undefined,
          installments: selectedMethod === "cartao" ? parseInt(installments) : undefined,
        });
      } else if (comanda) {
        await registerPayment({
          comandaId: comanda.id,
          orderId: comanda.order_id,
          amount: total,
          paymentMethod: selectedMethod,
          cashReceived: selectedMethod === "dinheiro" ? cashReceivedNum : undefined,
          changeAmount: selectedMethod === "dinheiro" ? changeAmount : undefined,
          installments: selectedMethod === "cartao" ? parseInt(installments) : undefined,
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    }
  };

  const isProcessing = isRegisteringPayment || isRegisteringTablePayment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pagamento - {title}
          </DialogTitle>
          <DialogDescription>
            Selecione a forma de pagamento e confirme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items Summary */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[120px]">
                <div className="space-y-1">
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-3" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-20 flex-col gap-2",
                    selectedMethod === method.id &&
                      "border-primary bg-primary/10"
                  )}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <method.icon
                    className={cn(
                      "h-6 w-6",
                      selectedMethod === method.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Cash specific fields */}
          {selectedMethod === "dinheiro" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cashReceived">Valor Recebido</Label>
                <CurrencyInput
                  id="cashReceived"
                  value={cashReceived}
                  onChange={setCashReceived}
                  placeholder="0,00"
                />
              </div>
              {cashReceivedNum > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Troco</span>
                    <span
                      className={cn(
                        "font-bold",
                        changeAmount > 0 ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card specific fields */}
          {selectedMethod === "cartao" && (
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select value={installments} onValueChange={setInstallments}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i}x {formatCurrency(total / i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar Pagamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
