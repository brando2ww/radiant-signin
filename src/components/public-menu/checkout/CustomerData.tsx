import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUpdateCustomer, DeliveryCustomer } from "@/hooks/use-delivery-customers";
import { Loader2, ChevronLeft } from "lucide-react";

interface CustomerDataProps {
  customer: DeliveryCustomer;
  onConfirm: () => void;
  onBack: () => void;
}

export const CustomerData = ({ customer, onConfirm, onBack }: CustomerDataProps) => {
  const [name, setName] = useState(customer.name || "");
  const [cpf, setCpf] = useState(customer.cpf || "");
  const updateCustomer = useUpdateCustomer();

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateCustomer.mutate(
      {
        id: customer.id,
        updates: {
          name,
          cpf: cpf || null,
        },
      },
      {
        onSuccess: () => {
          onConfirm();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF (opcional para nota)</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          <p className="text-xs text-muted-foreground">
            Informe seu CPF caso precise de nota fiscal
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!name || updateCustomer.isPending}
        >
          {updateCustomer.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Continuar
        </Button>
      </div>
    </form>
  );
};
