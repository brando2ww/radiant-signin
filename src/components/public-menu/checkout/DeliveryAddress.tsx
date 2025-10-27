import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCustomerAddresses } from "@/hooks/use-delivery-customers";
import { ChevronLeft, MapPin, Home } from "lucide-react";
import { AddressForm } from "./AddressForm";

interface DeliveryAddressProps {
  customerId: string;
  userId: string;
  onConfirm: (type: "delivery" | "pickup", addressId?: string, addressText?: string) => void;
  onBack: () => void;
}

export const DeliveryAddress = ({
  customerId,
  userId,
  onConfirm,
  onBack,
}: DeliveryAddressProps) => {
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const { data: addresses = [] } = useCustomerAddresses(customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderType === "pickup") {
      onConfirm("pickup");
      return;
    }

    if (!selectedAddressId) {
      return;
    }

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    if (selectedAddress) {
      const addressText = `${selectedAddress.street}, ${selectedAddress.number}${
        selectedAddress.complement ? `, ${selectedAddress.complement}` : ""
      } - ${selectedAddress.neighborhood}, ${selectedAddress.city}/${selectedAddress.state}`;
      
      onConfirm("delivery", selectedAddressId, addressText);
    }
  };

  if (showNewAddressForm) {
    return (
      <AddressForm
        customerId={customerId}
        onSuccess={(addressId, addressText) => {
          setShowNewAddressForm(false);
          setSelectedAddressId(addressId);
        }}
        onCancel={() => setShowNewAddressForm(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <RadioGroup value={orderType} onValueChange={(v: any) => setOrderType(v)}>
          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="delivery" id="delivery" />
            <Label htmlFor="delivery" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Delivery</span>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
            <RadioGroupItem value="pickup" id="pickup" />
            <Label htmlFor="pickup" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="font-medium">Retirar no Local</span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {orderType === "delivery" && (
          <div className="space-y-3">
            <Label>Selecione o Endereço de Entrega</Label>
            
            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                  <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{address.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {address.street}, {address.number}
                      {address.complement && `, ${address.complement}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {address.neighborhood} - {address.city}/{address.state}
                    </div>
                    {address.reference && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {address.reference}
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowNewAddressForm(true)}
            >
              + Adicionar Novo Endereço
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={orderType === "delivery" && !selectedAddressId}
        >
          Continuar
        </Button>
      </div>
    </form>
  );
};
