import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bill } from "@/hooks/use-bills";
import { BankAccountSelector } from "@/components/bank-accounts/BankAccountSelector";

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  onConfirm: (data: {
    payment_method?: string;
    bank_account_id?: string;
    paid_at: string;
  }) => Promise<void>;
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  bill,
  onConfirm,
}: MarkAsPaidDialogProps) {
  const [loading, setLoading] = useState(false);
  const [payment_method, setPaymentMethod] = useState("");
  const [bank_account_id, setBankAccountId] = useState("");
  const [paid_at, setPaidAt] = useState<Date>(new Date());

  const handleConfirm = async () => {
    if (!bill) return;

    setLoading(true);
    try {
      await onConfirm({
        payment_method: payment_method || undefined,
        bank_account_id: bank_account_id || undefined,
        paid_at: paid_at.toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como Paga</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Conta:</p>
            <p className="font-semibold">{bill.title}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Valor:</p>
            <p className="text-lg font-bold text-success">{formatCurrency(bill.amount)}</p>
          </div>

          <div className="space-y-2">
            <Label>Data de Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paid_at && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paid_at ? format(paid_at, "PPP", { locale: ptBR }) : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paid_at}
                  onSelect={(date) => date && setPaidAt(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={payment_method} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Conta Bancária</Label>
            <BankAccountSelector
              value={bank_account_id}
              onValueChange={setBankAccountId}
            />
            <p className="text-xs text-muted-foreground">
              Selecione uma conta para atualizar o saldo automaticamente
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
