import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle2, Circle, Package } from "lucide-react";
import { ProductOption } from "@/hooks/use-product-options";
import { formatBRL } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductOptionCardProps {
  option: ProductOption;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductOptionCard = ({ option, onEdit, onDelete }: ProductOptionCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{option.name}</h4>
            <Badge variant={option.type === "single" ? "default" : "secondary"}>
              {option.type === "single" ? "Escolha Única" : "Múltipla Escolha"}
            </Badge>
            {option.is_required && (
              <Badge variant="outline" className="text-destructive border-destructive">
                Obrigatório
              </Badge>
            )}
            {option.type === "multiple" && (
              <Badge variant="outline">
                {option.min_selections}-{option.max_selections} seleções
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {option.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                {item.is_available ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={!item.is_available ? "text-muted-foreground line-through" : ""}>
                  {item.name}
                </span>
                {item.price_adjustment !== 0 && (
                  <span className="text-muted-foreground">
                    {item.price_adjustment > 0 ? "+" : ""}
                    {formatBRL(item.price_adjustment)}
                  </span>
                )}
                {item.ingredient_id && (
                  <Badge variant="outline" className="text-xs gap-1 py-0 h-5">
                    <Package className="h-3 w-3" />
                    {item.ingredient_quantity} {item.ingredient_unit || "un"}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Opção</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a opção "{option.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};
