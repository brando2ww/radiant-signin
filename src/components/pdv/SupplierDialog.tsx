import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PDVSupplier } from "@/hooks/use-pdv-suppliers";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: PDVSupplier | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSubmit,
  isSubmitting,
}: SupplierDialogProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: "",
      cnpj: "",
      contact_name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        cnpj: supplier.cnpj || "",
        contact_name: supplier.contact_name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zip_code: supplier.zip_code || "",
        notes: supplier.notes || "",
        is_active: supplier.is_active,
      });
    } else {
      reset({
        name: "",
        cnpj: "",
        contact_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        notes: "",
        is_active: true,
      });
    }
  }, [supplier, reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Atualize as informações do fornecedor"
              : "Cadastre um novo fornecedor"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...register("cnpj")}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="contact_name">Nome do Contato</Label>
              <Input
                id="contact_name"
                {...register("contact_name")}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contato@fornecedor.com"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Rua, número"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} placeholder="Cidade" />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register("state")} placeholder="UF" />
            </div>

            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                {...register("zip_code")}
                placeholder="00000-000"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Informações adicionais"
                rows={3}
              />
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Fornecedor ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : supplier
                ? "Salvar"
                : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
