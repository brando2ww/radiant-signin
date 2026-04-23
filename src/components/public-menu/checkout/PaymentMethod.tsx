import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePublicSettings } from "@/hooks/use-public-menu";
import { ChevronLeft, CreditCard, Smartphone } from "lucide-react";
import { formatBRL } from "@/lib/format";

interface PaymentMethodProps {
  userId: string;
  total: number;
  onConfirm: (method: string, changeFor?: number) => void;
  onBack: () => void;
}

export const PaymentMethod = ({ userId, total, onConfirm, onBack }: PaymentMethodProps) => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [changeFor, setChangeFor] = useState("");
  const { data: settings } = usePublicSettings(userId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const changeValue = paymentMethod === "cash" && changeFor ? Number(changeFor) : undefined;
    onConfirm(paymentMethod, changeValue);
  };

  const availableMethods = [];
  if (settings?.accepts_pix) {
    availableMethods.push({ value: "pix", label: "PIX", icon: Smartphone });
  }
  if (settings?.accepts_credit) {
    availableMethods.push({ value: "credit", label: "Cartão de Crédito (na entrega)", icon: CreditCard });
  }
  if (settings?.accepts_debit) {
    availableMethods.push({ value: "debit", label: "Cartão de Débito (na entrega)", icon: CreditCard });
  }
  if (settings?.accepts_cash) {
    availableMethods.push({ value: "cash", label: "Dinheiro", icon: CreditCard });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>Escolha a forma de pagamento</Label>
        
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          {availableMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.value}
                className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
              >
                <RadioGroupItem value={method.value} id={method.value} />
                <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{method.label}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {settings?.accepts_pix && settings.pix_key && paymentMethod === "pix" && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">Chave PIX:</p>
            <p className="text-sm text-muted-foreground">{settings.pix_key}</p>
            <p className="text-xs text-muted-foreground">
              O pagamento será confirmado na entrega
            </p>
          </div>
        )}

        {paymentMethod === "cash" && (
          <div className="space-y-2">
            <Label htmlFor="changeFor">Troco para (opcional)</Label>
            <Input
              id="changeFor"
              type="number"
              step="0.01"
              min={total}
              value={changeFor}
              onChange={(e) => setChangeFor(e.target.value)}
              placeholder={`${formatBRL(total)}`}
            />
            <p className="text-xs text-muted-foreground">
              Informe o valor caso precise de troco
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1" disabled={!paymentMethod}>
          Continuar
        </Button>
      </div>
    </form>
  );
};
