import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EditableInvoiceItem, LinkActionType, NewIngredientData } from "@/types/invoice";
import { IngredientLinker } from "./IngredientLinker";

interface ProductItemEditorProps {
  item: EditableInvoiceItem;
  onUpdate: (updates: Partial<EditableInvoiceItem>) => void;
}

export function ProductItemEditor({ item, onUpdate }: ProductItemEditorProps) {
  const handleFieldChange = (field: keyof EditableInvoiceItem, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleTaxChange = (taxField: keyof EditableInvoiceItem['taxes'], value: number) => {
    onUpdate({
      taxes: {
        ...item.taxes,
        [taxField]: value,
      },
    });
  };

  const handleLinkActionChange = (action: {
    type: LinkActionType;
    ingredientId?: string;
    newIngredientData?: NewIngredientData;
  }) => {
    onUpdate({ linkAction: action });
  };

  const getItemStatusColor = () => {
    switch (item.linkAction.type) {
      case 'link':
        return 'border-l-4 border-l-green-500';
      case 'create':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-muted';
    }
  };

  return (
    <Card className={`p-4 ${getItemStatusColor()}`}>
      <div className="space-y-4">
        {/* Informações Básicas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Item {item.itemNumber}</h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <Label htmlFor={`name-${item.itemNumber}`} className="text-xs">Nome do Produto</Label>
              <Input
                id={`name-${item.itemNumber}`}
                value={item.productName}
                onChange={(e) => handleFieldChange('productName', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor={`code-${item.itemNumber}`} className="text-xs">Código</Label>
              <Input
                id={`code-${item.itemNumber}`}
                value={item.productCode || ''}
                onChange={(e) => handleFieldChange('productCode', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor={`ean-${item.itemNumber}`} className="text-xs">EAN</Label>
              <Input
                id={`ean-${item.itemNumber}`}
                value={item.productEan || ''}
                onChange={(e) => handleFieldChange('productEan', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor={`ncm-${item.itemNumber}`} className="text-xs">NCM</Label>
              <Input
                id={`ncm-${item.itemNumber}`}
                value={item.ncm || ''}
                onChange={(e) => handleFieldChange('ncm', e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quantidades e Valores */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label htmlFor={`quantity-${item.itemNumber}`} className="text-xs">Quantidade</Label>
            <Input
              id={`quantity-${item.itemNumber}`}
              type="number"
              step="0.01"
              value={item.quantity}
              onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value))}
              className="h-8"
            />
          </div>

          <div>
            <Label htmlFor={`unit-${item.itemNumber}`} className="text-xs">Unidade</Label>
            <Input
              id={`unit-${item.itemNumber}`}
              value={item.unit}
              onChange={(e) => handleFieldChange('unit', e.target.value)}
              className="h-8"
            />
          </div>

          <div>
            <Label htmlFor={`unit-value-${item.itemNumber}`} className="text-xs">Valor Unitário (R$)</Label>
            <Input
              id={`unit-value-${item.itemNumber}`}
              type="number"
              step="0.01"
              value={item.unitValue}
              onChange={(e) => handleFieldChange('unitValue', parseFloat(e.target.value))}
              className="h-8"
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor={`total-value-${item.itemNumber}`} className="text-xs">Valor Total (R$)</Label>
            <Input
              id={`total-value-${item.itemNumber}`}
              type="number"
              step="0.01"
              value={item.totalValue}
              onChange={(e) => handleFieldChange('totalValue', parseFloat(e.target.value))}
              className="h-8"
              placeholder="0,00"
            />
          </div>
        </div>

        <Separator />

        {/* Impostos */}
        <div>
          <Label className="text-xs mb-2 block">Impostos</Label>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label htmlFor={`icms-${item.itemNumber}`} className="text-xs text-muted-foreground">ICMS (R$)</Label>
              <Input
                id={`icms-${item.itemNumber}`}
                type="number"
                step="0.01"
                value={item.taxes.icms || 0}
                onChange={(e) => handleTaxChange('icms', parseFloat(e.target.value))}
                className="h-8"
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor={`ipi-${item.itemNumber}`} className="text-xs text-muted-foreground">IPI (R$)</Label>
              <Input
                id={`ipi-${item.itemNumber}`}
                type="number"
                step="0.01"
                value={item.taxes.ipi || 0}
                onChange={(e) => handleTaxChange('ipi', parseFloat(e.target.value))}
                className="h-8"
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor={`pis-${item.itemNumber}`} className="text-xs text-muted-foreground">PIS (R$)</Label>
              <Input
                id={`pis-${item.itemNumber}`}
                type="number"
                step="0.01"
                value={item.taxes.pis || 0}
                onChange={(e) => handleTaxChange('pis', parseFloat(e.target.value))}
                className="h-8"
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor={`cofins-${item.itemNumber}`} className="text-xs text-muted-foreground">COFINS (R$)</Label>
              <Input
                id={`cofins-${item.itemNumber}`}
                type="number"
                step="0.01"
                value={item.taxes.cofins || 0}
                onChange={(e) => handleTaxChange('cofins', parseFloat(e.target.value))}
                className="h-8"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Vinculação de Ingrediente */}
        <IngredientLinker
          itemName={item.productName}
          itemCode={item.productCode}
          itemEan={item.productEan}
          itemUnit={item.unit}
          itemUnitCost={item.unitValue}
          linkAction={item.linkAction}
          onLinkChange={handleLinkActionChange}
        />
      </div>
    </Card>
  );
}
