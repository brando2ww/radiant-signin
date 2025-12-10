import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { paymentMethods } from "@/data/transaction-categories";
import { Repeat } from "lucide-react";

interface StepDetailsProps {
  description: string;
  paymentMethod: string;
  isRecurring: boolean;
  onDescriptionChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onRecurringChange: (value: boolean) => void;
}

export const StepDetails = ({
  description,
  paymentMethod,
  isRecurring,
  onDescriptionChange,
  onPaymentMethodChange,
  onRecurringChange,
}: StepDetailsProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Mais detalhes</h2>
        <p className="text-sm text-muted-foreground">
          Adicione informações complementares
        </p>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição</label>
        <Input
          placeholder="Ex: Venda de produtos no balcão"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="h-12"
        />
      </div>

      {/* Método de pagamento */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Método de pagamento</label>
        <div className="flex flex-wrap gap-2">
          {paymentMethods.map((method) => (
            <Button
              key={method.value}
              type="button"
              variant={paymentMethod === method.value ? "default" : "outline"}
              size="sm"
              onClick={() => onPaymentMethodChange(method.value)}
              className="rounded-full"
            >
              {method.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recorrência */}
      <Card className={cn(isRecurring && "ring-2 ring-primary bg-primary/5")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isRecurring ? "bg-primary/20" : "bg-muted"
            )}>
              <Repeat className={cn(
                "w-4 h-4",
                isRecurring ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-medium text-sm">Transação recorrente</p>
              <p className="text-xs text-muted-foreground">Repetir todo mês</p>
            </div>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
