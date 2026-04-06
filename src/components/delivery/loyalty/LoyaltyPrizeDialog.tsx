import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateLoyaltyPrize, useUpdateLoyaltyPrize } from "@/hooks/use-delivery-loyalty";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prize?: any;
}

interface FormValues {
  name: string;
  description: string;
  points_cost: number;
  is_active: boolean;
  max_quantity: string;
}

export function LoyaltyPrizeDialog({ open, onOpenChange, prize }: Props) {
  const create = useCreateLoyaltyPrize();
  const update = useUpdateLoyaltyPrize();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: { name: "", description: "", points_cost: 50, is_active: true, max_quantity: "" },
  });

  useEffect(() => {
    if (prize) {
      reset({
        name: prize.name,
        description: prize.description || "",
        points_cost: prize.points_cost,
        is_active: prize.is_active,
        max_quantity: prize.max_quantity?.toString() || "",
      });
    } else {
      reset({ name: "", description: "", points_cost: 50, is_active: true, max_quantity: "" });
    }
  }, [prize, open, reset]);

  const isActive = watch("is_active");
  const isPending = create.isPending || update.isPending;

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      points_cost: values.points_cost,
      is_active: values.is_active,
      max_quantity: values.max_quantity ? parseInt(values.max_quantity) : null,
    };

    if (prize) {
      update.mutate({ id: prize.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prize ? "Editar Prêmio" : "Novo Prêmio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input {...register("name", { required: true })} placeholder="Ex: Sobremesa grátis" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("description")} placeholder="Descrição do prêmio" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custo em pontos *</Label>
              <Input type="number" min="1" {...register("points_cost", { valueAsNumber: true, required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Qtd. máxima (opcional)</Label>
              <Input type="number" min="1" {...register("max_quantity")} placeholder="Ilimitado" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {prize ? "Salvar" : "Criar Prêmio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
