import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCustomerAddresses } from "@/hooks/use-delivery-customers";
import { ChevronLeft, MapPin, Home, Loader2 } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { CEPInput } from "@/components/ui/cep-input";
import { useCEPLookup } from "@/hooks/use-cep-lookup";

interface DeliveryAddressProps {
  customerId: string;
  userId: string;
  onConfirm: (type: "delivery" | "pickup", addressId?: string, addressText?: string) => void;
  onBack: () => void;
}

interface CEPData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const DeliveryAddress = ({
  customerId,
  userId,
  onConfirm,
  onBack,
}: DeliveryAddressProps) => {
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [step, setStep] = useState<"type" | "cep" | "address" | "form">("type");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [cepValue, setCepValue] = useState("");
  const [cepData, setCepData] = useState<CEPData | null>(null);

  const { data: addresses = [] } = useCustomerAddresses(customerId);
  const { lookupCEP, isLoading: isLoadingCEP } = useCEPLookup();

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "pickup") {
      onConfirm("pickup");
      return;
    }
    if (addresses.length > 0) {
      setStep("address");
    } else {
      setStep("cep");
    }
  };

  const handleCEPChange = async (value: string) => {
    setCepValue(value);
    setCepData(null);
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      const data = await lookupCEP(value);
      if (data) {
        setCepData({
          zipCode: value,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        });
      }
    }
  };

  const handleAddressSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) return;
    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    if (selectedAddress) {
      const addressText = `${selectedAddress.street}, ${selectedAddress.number}${
        selectedAddress.complement ? `, ${selectedAddress.complement}` : ""
      } - ${selectedAddress.neighborhood}, ${selectedAddress.city}/${selectedAddress.state}`;
      onConfirm("delivery", selectedAddressId, addressText);
    }
  };

  // Step: CEP input
  if (step === "cep") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cep-lookup">Digite seu CEP</Label>
          <div className="relative">
            <CEPInput
              id="cep-lookup"
              value={cepValue}
              onChange={handleCEPChange}
              className="text-lg"
            />
            {isLoadingCEP && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {cepData && (
            <p className="text-sm text-muted-foreground">
              {cepData.street && `${cepData.street} - `}{cepData.neighborhood}, {cepData.city}/{cepData.state}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => { setStep(addresses.length > 0 ? "address" : "type"); setCepValue(""); setCepData(null); }}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button
            className="flex-1"
            disabled={!cepData}
            onClick={() => setStep("form")}
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // Step: Address form with pre-filled CEP data
  if (step === "form") {
    return (
      <AddressForm
        customerId={customerId}
        initialZipCode={cepData?.zipCode}
        initialStreet={cepData?.street}
        initialNeighborhood={cepData?.neighborhood}
        initialCity={cepData?.city}
        initialState={cepData?.state}
        onSuccess={(addressId, addressText) => {
          onConfirm("delivery", addressId, addressText);
        }}
        onCancel={() => { setStep("cep"); }}
      />
    );
  }

  // Step: Select from existing addresses
  if (step === "address") {
    return (
      <form onSubmit={handleAddressSelect} className="space-y-6">
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
            onClick={() => { setCepValue(""); setCepData(null); setStep("cep"); }}
          >
            + Adicionar Novo Endereço
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep("type")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button type="submit" className="flex-1" disabled={!selectedAddressId}>
            Continuar
          </Button>
        </div>
      </form>
    );
  }

  // Step: Type selection (default)
  return (
    <form onSubmit={handleTypeSubmit} className="space-y-6">
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
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Continuar
        </Button>
      </div>
    </form>
  );
};
