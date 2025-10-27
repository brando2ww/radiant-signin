import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useGetOrCreateCustomer, DeliveryCustomer } from "@/hooks/use-delivery-customers";
import { Loader2 } from "lucide-react";

interface CustomerIdentificationProps {
  onConfirm: (customer: DeliveryCustomer) => void;
}

export const CustomerIdentification = ({ onConfirm }: CustomerIdentificationProps) => {
  const [phone, setPhone] = useState("");
  const getOrCreateCustomer = useGetOrCreateCustomer();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2");
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    
    getOrCreateCustomer.mutate(cleanPhone, {
      onSuccess: (customer) => {
        onConfirm(customer);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            required
          />
          <p className="text-xs text-muted-foreground">
            Digite seu telefone para continuar
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={phone.replace(/\D/g, "").length < 10 || getOrCreateCustomer.isPending}
      >
        {getOrCreateCustomer.isPending && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        )}
        Continuar
      </Button>
    </form>
  );
};
