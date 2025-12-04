import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Lead } from "@/hooks/use-crm-leads";
import { useConvertLead, useMarkLeadAsWon } from "@/hooks/use-convert-lead";
import { BankAccountSelector } from "@/components/bank-accounts/BankAccountSelector";
import { incomeCategories, paymentMethods } from "@/data/transaction-categories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Trophy, Percent } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export function ConvertLeadDialog({ open, onOpenChange, lead }: ConvertLeadDialogProps) {
  const convertLead = useConvertLead();
  const markAsWon = useMarkLeadAsWon();

  const [saleValue, setSaleValue] = useState(0);
  const [commissionPercentage, setCommissionPercentage] = useState(100);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [category, setCategory] = useState("comissoes");
  const [bankAccountId, setBankAccountId] = useState<string | undefined>();
  const [description, setDescription] = useState("");

  const revenueValue = (saleValue * commissionPercentage) / 100;

  useEffect(() => {
    if (lead && open) {
      setSaleValue(lead.estimated_value || 0);
      setDescription(`Comissão - ${lead.project_title} (${lead.name})`);
    }
  }, [lead, open]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleConvertWithRevenue = async () => {
    if (!lead) return;

    await convertLead.mutateAsync({
      leadId: lead.id,
      saleValue,
      commissionPercentage,
      revenueValue,
      transactionDate,
      paymentMethod,
      category,
      bankAccountId,
      description,
    });

    fireConfetti();
    onOpenChange(false);
  };

  const handleConvertWithoutRevenue = async () => {
    if (!lead) return;

    await markAsWon.mutateAsync(lead.id);
    fireConfetti();
    onOpenChange(false);
  };

  if (!lead) return null;

  const isPending = convertLead.isPending || markAsWon.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success" />
            Fechar Venda
          </DialogTitle>
          <DialogDescription>
            Registre a receita desta venda diretamente no financeiro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lead Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">{lead.name}</p>
            <p className="text-sm text-muted-foreground">{lead.project_title}</p>
          </div>

          {/* Sale Value */}
          <div className="space-y-2">
            <Label>Valor Total da Venda</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                type="number"
                value={saleValue}
                onChange={(e) => setSaleValue(Number(e.target.value))}
                className="pl-10"
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {/* Commission Percentage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Sua Comissão (%)
            </Label>
            <Input
              type="number"
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(Number(e.target.value))}
              min={0}
              max={100}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              Use 100% se o valor total é sua receita
            </p>
          </div>

          {/* Revenue Value (calculated) */}
          <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Valor da Receita</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(revenueValue)}
            </p>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label>Data do Recebimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !transactionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transactionDate
                    ? format(transactionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={(date) => date && setTransactionDate(date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label>Conta Bancária (opcional)</Label>
            <BankAccountSelector
              value={bankAccountId}
              onValueChange={setBankAccountId}
              placeholder="Selecione uma conta"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleConvertWithoutRevenue}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Fechar sem receita
          </Button>
          <Button
            onClick={handleConvertWithRevenue}
            disabled={isPending || revenueValue <= 0}
            className="w-full sm:w-auto bg-success text-success-foreground hover:bg-success/90"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Fechar e Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
