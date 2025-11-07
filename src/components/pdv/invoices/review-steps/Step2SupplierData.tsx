import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePDVSuppliers } from "@/hooks/use-pdv-suppliers";
import { EditableInvoiceData, EditableSupplierData } from "@/types/invoice";
import { formatCNPJ } from "@/lib/invoice/validators";
import { useState } from "react";

interface Step2SupplierDataProps {
  data: EditableInvoiceData;
  onUpdate: (updates: Partial<EditableInvoiceData>) => void;
}

export function Step2SupplierData({ data, onUpdate }: Step2SupplierDataProps) {
  const { suppliers } = usePDVSuppliers();
  const [open, setOpen] = useState(false);

  const selectedSupplier = data.supplier.existingId
    ? suppliers.find(s => s.id === data.supplier.existingId)
    : null;

  const handleModeChange = (mode: 'existing' | 'new') => {
    onUpdate({
      supplier: {
        mode,
        existingId: mode === 'existing' ? undefined : data.supplier.existingId,
        newData: mode === 'new' ? data.supplier.newData : undefined,
      },
    });
  };

  const handleSelectExisting = (supplierId: string) => {
    onUpdate({
      supplier: {
        mode: 'existing',
        existingId: supplierId,
      },
    });
    setOpen(false);
  };

  const handleNewDataChange = (field: keyof EditableSupplierData, value: string) => {
    if (data.supplier.mode === 'new') {
      onUpdate({
        supplier: {
          ...data.supplier,
          newData: {
            ...data.supplier.newData!,
            [field]: value,
          },
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Dados do Fornecedor</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um fornecedor existente ou cadastre um novo.
        </p>
      </div>

      <RadioGroup
        value={data.supplier.mode}
        onValueChange={(value) => handleModeChange(value as 'existing' | 'new')}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="font-normal cursor-pointer">
            Selecionar fornecedor existente
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="font-normal cursor-pointer">
            Cadastrar novo fornecedor
          </Label>
        </div>
      </RadioGroup>

      {data.supplier.mode === 'existing' && (
        <div>
          <Label>Fornecedor</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between mt-1"
              >
                {selectedSupplier ? selectedSupplier.name : "Selecione um fornecedor..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar fornecedor..." />
                <CommandList>
                  <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                  <CommandGroup>
                    {suppliers.map((supplier) => (
                      <CommandItem
                        key={supplier.id}
                        value={`${supplier.name} ${supplier.cnpj || ''}`}
                        onSelect={() => handleSelectExisting(supplier.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSupplier?.id === supplier.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{supplier.name}</p>
                          {supplier.cnpj && (
                            <p className="text-xs text-muted-foreground">
                              CNPJ: {formatCNPJ(supplier.cnpj)}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedSupplier && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium">{selectedSupplier.name}</p>
              {selectedSupplier.cnpj && (
                <p className="text-xs text-muted-foreground">
                  CNPJ: {formatCNPJ(selectedSupplier.cnpj)}
                </p>
              )}
              {selectedSupplier.address && (
                <p className="text-xs text-muted-foreground">{selectedSupplier.address}</p>
              )}
            </div>
          )}
        </div>
      )}

      {data.supplier.mode === 'new' && data.supplier.newData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="supplier-name">Nome / Razão Social *</Label>
              <Input
                id="supplier-name"
                value={data.supplier.newData.name}
                onChange={(e) => handleNewDataChange('name', e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <Label htmlFor="supplier-company">Nome Fantasia</Label>
              <Input
                id="supplier-company"
                value={data.supplier.newData.company_name || ''}
                onChange={(e) => handleNewDataChange('company_name', e.target.value)}
                placeholder="Nome fantasia"
              />
            </div>

            <div>
              <Label htmlFor="supplier-cnpj">CNPJ</Label>
              <Input
                id="supplier-cnpj"
                value={data.supplier.newData.cnpj || ''}
                onChange={(e) => handleNewDataChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="supplier-state-reg">Inscrição Estadual</Label>
              <Input
                id="supplier-state-reg"
                value={data.supplier.newData.state_registration || ''}
                onChange={(e) => handleNewDataChange('state_registration', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="supplier-phone">Telefone</Label>
              <Input
                id="supplier-phone"
                value={data.supplier.newData.phone || ''}
                onChange={(e) => handleNewDataChange('phone', e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={data.supplier.newData.email || ''}
                onChange={(e) => handleNewDataChange('email', e.target.value)}
                placeholder="email@fornecedor.com"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="supplier-address">Endereço</Label>
              <Input
                id="supplier-address"
                value={data.supplier.newData.address || ''}
                onChange={(e) => handleNewDataChange('address', e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div>
              <Label htmlFor="supplier-city">Cidade</Label>
              <Input
                id="supplier-city"
                value={data.supplier.newData.city || ''}
                onChange={(e) => handleNewDataChange('city', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="supplier-state">Estado</Label>
              <Input
                id="supplier-state"
                value={data.supplier.newData.state || ''}
                onChange={(e) => handleNewDataChange('state', e.target.value)}
                placeholder="UF"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="supplier-zip">CEP</Label>
              <Input
                id="supplier-zip"
                value={data.supplier.newData.zip_code || ''}
                onChange={(e) => handleNewDataChange('zip_code', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
