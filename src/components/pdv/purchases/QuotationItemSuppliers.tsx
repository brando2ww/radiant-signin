import { useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { usePDVIngredientSuppliers } from "@/hooks/use-pdv-ingredient-suppliers";
import { AlertCircle } from "lucide-react";

interface QuotationItemSuppliersProps {
  ingredientId: string;
  selectedSuppliers: string[];
  onSuppliersChange: (suppliers: string[]) => void;
}

export function QuotationItemSuppliers({
  ingredientId,
  selectedSuppliers,
  onSuppliersChange,
}: QuotationItemSuppliersProps) {
  const { ingredientSuppliers, isLoading } = usePDVIngredientSuppliers(ingredientId);

  // Filter suppliers for this ingredient
  const suppliers = useMemo(() => {
    return ingredientSuppliers.filter(
      (is) => is.ingredient_id === ingredientId && is.supplier
    );
  }, [ingredientSuppliers, ingredientId]);

  // Auto-select preferred suppliers on first load
  useEffect(() => {
    if (suppliers.length > 0 && selectedSuppliers.length === 0) {
      const preferredIds = suppliers
        .filter((s) => s.is_preferred && s.supplier?.phone)
        .map((s) => s.supplier_id);
      if (preferredIds.length > 0) {
        onSuppliersChange(preferredIds);
      }
    }
  }, [suppliers, selectedSuppliers.length, onSuppliersChange]);

  const handleToggle = (supplierId: string) => {
    if (selectedSuppliers.includes(supplierId)) {
      onSuppliersChange(selectedSuppliers.filter((id) => id !== supplierId));
    } else {
      onSuppliersChange([...selectedSuppliers, supplierId]);
    }
  };

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground mt-2 pl-2">
        Carregando fornecedores...
      </div>
    );
  }

  if (!ingredientId) {
    return null;
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-3 w-3 shrink-0" />
        <span>Nenhum fornecedor vinculado a este ingrediente</span>
      </div>
    );
  }

  return (
    <div className="mt-2 pl-2 space-y-1">
      <span className="text-xs text-muted-foreground font-medium">Fornecedores:</span>
      <div className="space-y-1">
        {suppliers.map((link) => {
          const supplier = link.supplier!;
          const hasPhone = !!supplier.phone;
          const isSelected = selectedSuppliers.includes(link.supplier_id);

          return (
            <div
              key={link.id}
              className={`flex items-center gap-2 p-1.5 rounded text-xs ${
                !hasPhone ? "opacity-50" : "cursor-pointer hover:bg-muted/50"
              } ${isSelected ? "bg-primary/5" : ""}`}
              onClick={() => hasPhone && handleToggle(link.supplier_id)}
            >
              <Checkbox
                checked={isSelected}
                disabled={!hasPhone}
                onCheckedChange={() => hasPhone && handleToggle(link.supplier_id)}
                className="h-3.5 w-3.5"
              />
              <span className="flex-1">{supplier.name}</span>
              {link.is_preferred && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1">
                  Preferido
                </Badge>
              )}
              {!hasPhone && (
                <Badge variant="outline" className="text-[10px] py-0 px-1 text-amber-600">
                  Sem WhatsApp
                </Badge>
              )}
              {hasPhone && (
                <span className="text-muted-foreground">{supplier.phone}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
