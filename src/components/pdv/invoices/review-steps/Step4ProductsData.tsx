import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Plus, Sparkles } from "lucide-react";
import { EditableInvoiceData, EditableInvoiceItem } from "@/types/invoice";
import { ProductItemEditor } from "../ProductItemEditor";

interface Step4ProductsDataProps {
  data: EditableInvoiceData;
  onUpdate: (updates: Partial<EditableInvoiceData>) => void;
}

export function Step4ProductsData({ data, onUpdate }: Step4ProductsDataProps) {
  const handleItemUpdate = (index: number, updates: Partial<EditableInvoiceItem>) => {
    const updatedItems = [...data.items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    onUpdate({ items: updatedItems });
  };

  const linkedCount = data.items.filter((i) => i.linkAction.type === "link").length;
  const createCount = data.items.filter((i) => i.linkAction.type === "create").length;
  const noneCount = data.items.filter((i) => i.linkAction.type === "none").length;
  const suggestPendingCount = data.items.filter(
    (i) =>
      i.linkAction.type === "none" &&
      i.suggestedIngredientIds &&
      i.suggestedIngredientIds.length > 0
  ).length;
  const noMatchCount = noneCount - suggestPendingCount;

  const handleAcceptAllSuggestions = () => {
    const updatedItems = data.items.map((item) => {
      if (
        item.linkAction.type === "none" &&
        item.suggestedIngredientIds &&
        item.suggestedIngredientIds.length > 0
      ) {
        return {
          ...item,
          linkAction: { type: "link" as const, ingredientId: item.suggestedIngredientIds[0] },
        };
      }
      return item;
    });
    onUpdate({ items: updatedItems });
  };

  const handleCreateAllUnmatched = () => {
    const updatedItems = data.items.map((item) => {
      if (item.linkAction.type !== "none") return item;
      return {
        ...item,
        linkAction: {
          type: "create" as const,
          newIngredientData: {
            name: item.productName,
            code: item.productCode,
            ean: item.productEan,
            unit: item.unit,
            min_stock: 0,
            unit_cost: item.unitValue,
          },
        },
      };
    });
    onUpdate({ items: updatedItems });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Produtos da Nota Fiscal</h3>
        <p className="text-sm text-muted-foreground">
          O sistema tentou vincular cada item ao seu estoque automaticamente. Revise antes de
          confirmar.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1">
          Total: {data.items.length}
        </Badge>
        {linkedCount > 0 && (
          <Badge variant="outline" className="gap-1 border-primary text-primary">
            <Check className="h-3 w-3" /> {linkedCount} vinculado(s)
          </Badge>
        )}
        {suggestPendingCount > 0 && (
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" /> {suggestPendingCount} sugestão(ões) a confirmar
          </Badge>
        )}
        {createCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Plus className="h-3 w-3" /> {createCount} novo(s)
          </Badge>
        )}
        {noMatchCount > 0 && (
          <Badge variant="outline" className="gap-1 border-destructive text-destructive">
            <AlertCircle className="h-3 w-3" /> {noMatchCount} sem vinculação
          </Badge>
        )}
      </div>

      {noneCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Existem {noneCount} item(ns) sem vinculação. Você não poderá confirmar a importação
            enquanto cada item não estiver vinculado a um insumo existente ou marcado para criar
            como novo.
          </AlertDescription>
        </Alert>
      )}

      {/* Ações em massa */}
      <div className="flex gap-2 flex-wrap">
        {suggestPendingCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleAcceptAllSuggestions}>
            <Sparkles className="h-4 w-4 mr-2" />
            Aceitar todas as sugestões ({suggestPendingCount})
          </Button>
        )}
        {noneCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleCreateAllUnmatched}>
            <Plus className="h-4 w-4 mr-2" />
            Criar todos os sem vínculo como novos
          </Button>
        )}
      </div>

      {/* Lista de produtos */}
      <ScrollArea className="max-h-[450px] pr-4">
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <ProductItemEditor
              key={index}
              item={item}
              onUpdate={(updates) => handleItemUpdate(index, updates)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
