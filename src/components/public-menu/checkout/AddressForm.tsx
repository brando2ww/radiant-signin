import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateAddress } from "@/hooks/use-delivery-customers";
import { Loader2 } from "lucide-react";
import { CEPInput } from "@/components/ui/cep-input";
import { useCEPLookup } from "@/hooks/use-cep-lookup";

interface AddressFormProps {
  customerId: string;
  onSuccess: (addressId: string, addressText: string) => void;
  onCancel: () => void;
}

export const AddressForm = ({ customerId, onSuccess, onCancel }: AddressFormProps) => {
  const [label, setLabel] = useState("Casa");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [reference, setReference] = useState("");

  const createAddress = useCreateAddress();
  const { lookupCEP, isLoading: isLoadingCEP } = useCEPLookup();

  const handleCEPChange = async (value: string) => {
    setZipCode(value);
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      const data = await lookupCEP(value);
      if (data) {
        if (data.logradouro) setStreet(data.logradouro);
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(data.localidade);
        if (data.uf) setState(data.uf);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addressData = {
      customer_id: customerId,
      label,
      street,
      number,
      complement: complement || null,
      neighborhood,
      city,
      state,
      zip_code: zipCode || null,
      reference: reference || null,
      is_default: false,
    };

    createAddress.mutate(addressData, {
      onSuccess: (data) => {
        const addressText = `${data.street}, ${data.number}${
          data.complement ? `, ${data.complement}` : ""
        } - ${data.neighborhood}, ${data.city}/${data.state}`;
        onSuccess(data.id, addressText);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Nome do Endereço *</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Casa, Trabalho..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">CEP</Label>
          <div className="relative">
            <CEPInput
              id="zipCode"
              value={zipCode}
              onChange={handleCEPChange}
            />
            {isLoadingCEP && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Rua *</Label>
        <Input
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Nome da rua"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="123"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apto, bloco..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood">Bairro *</Label>
        <Input
          id="neighborhood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Nome do bairro"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Nome da cidade"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            placeholder="UF"
            maxLength={2}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Ponto de Referência</Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Próximo ao..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={createAddress.isPending}>
          {createAddress.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Salvar Endereço
        </Button>
      </div>
    </form>
  );
};
