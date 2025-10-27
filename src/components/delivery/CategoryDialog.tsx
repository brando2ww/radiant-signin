import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import {
  DeliveryCategory,
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-delivery-categories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: DeliveryCategory;
}

export const CategoryDialog = ({ open, onOpenChange, category }: CategoryDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setIsActive(category.is_active);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
    }
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (category) {
      updateCategory.mutate(
        {
          id: category.id,
          updates: { name, description, is_active: isActive },
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createCategory.mutate(
        {
          name,
          description,
          is_active: isActive,
          image_url: null,
          order_position: 0,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pizzas, Bebidas..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional da categoria"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Categoria ativa</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {category ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
