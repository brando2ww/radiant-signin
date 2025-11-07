import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Plus } from "lucide-react";
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

  const linkedCount = data.items.filter(i => i.linkAction.type === 'link').length;
  const createCount = data.items.filter(i => i.linkAction.type === 'create').length;
  const noneCount = data.items.filter(i => i.linkAction.type === 'none').length;

  const handleLinkAllPossible = () => {
    // Esta função seria implementada para vincular automaticamente todos os itens possíveis
    // Por ora, apenas um placeholder
  };

  const handleCreateAllNew = () => {
    const updatedItems = data.items.map(item => ({
      ...item,
      linkAction: {
        type: 'create' as const,
        newIngredientData: {
          name: item.productName,
          code: item.productCode,
          ean: item.productEan,
          unit: item.unit,
          min_stock: 0,
          unit_cost: item.unitValue,
        },
      },
    }));
    onUpdate({ items: updatedItems });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Produtos da Nota Fiscal</h3>
        <p className="text-sm text-muted-foreground">
          Edite os dados dos produtos e configure a vinculação com o estoque.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1">
          Total: {data.items.length} itens
        </Badge>
        {linkedCount > 0 && (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
            <Check className="h-3 w-3" /> {linkedCount} vinculado(s)
          </Badge>
        )}
        {createCount > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Plus className="h-3 w-3" /> {createCount} novo(s)
          </Badge>
        )}
        {noneCount > 0 && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <AlertCircle className="h-3 w-3" /> {noneCount} sem vinculação
          </Badge>
        )}
      </div>

      {/* Ações em massa */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCreateAllNew}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Todos como Novos
        </Button>
      </div>

      {/* Lista de produtos */}
      <ScrollArea className="h-[400px] pr-4">
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
