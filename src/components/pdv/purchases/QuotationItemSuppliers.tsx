import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { usePDVIngredientSuppliers } from "@/hooks/use-pdv-ingredient-suppliers";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

interface SupplierItem {
  id: string;
  supplier_id: string;
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    contact_name: string | null;
  };
  is_preferred: boolean;
  is_direct: boolean;
}

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
  const { ingredientSuppliers, isLoading: isLoadingMultiple } = usePDVIngredientSuppliers(ingredientId);

  // Fetch the ingredient with its direct supplier
  const { data: ingredientData, isLoading: isLoadingDirect } = useQuery({
    queryKey: ['ingredient-direct-supplier', ingredientId],
    queryFn: async () => {
      if (!ingredientId) return null;
      const { data, error } = await supabase
        .from('pdv_ingredients')
        .select(`
          id,
          supplier_id,
          supplier:pdv_suppliers(id, name, phone, email, contact_name)
        `)
        .eq('id', ingredientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ingredientId,
  });

  const isLoading = isLoadingMultiple || isLoadingDirect;

  // Combine suppliers from both sources (direct + multiple)
  const suppliers = useMemo((): SupplierItem[] => {
    const result: SupplierItem[] = [];
    
    // Add direct supplier from pdv_ingredients.supplier_id
    if (ingredientData?.supplier && typeof ingredientData.supplier === 'object' && !Array.isArray(ingredientData.supplier)) {
      const directSupplier = ingredientData.supplier as {
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        contact_name: string | null;
      };
      result.push({
        id: `direct-${directSupplier.id}`,
        supplier_id: directSupplier.id,
        supplier: directSupplier,
        is_preferred: true, // Direct supplier is primary
        is_direct: true,
      });
    }
    
    // Add suppliers from pdv_ingredient_suppliers table
    ingredientSuppliers
      .filter((is) => is.ingredient_id === ingredientId && is.supplier)
      .forEach((is) => {
        // Avoid duplicates
        if (!result.some((r) => r.supplier_id === is.supplier_id)) {
          result.push({
            id: is.id,
            supplier_id: is.supplier_id,
            supplier: is.supplier!,
            is_preferred: is.is_preferred,
            is_direct: false,
          });
        }
      });
    
    return result;
  }, [ingredientData, ingredientSuppliers, ingredientId]);

  // Auto-select preferred/direct suppliers on first load
  useEffect(() => {
    if (suppliers.length > 0 && selectedSuppliers.length === 0) {
      const preferredIds = suppliers
        .filter((s) => (s.is_preferred || s.is_direct) && s.supplier?.phone)
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
          const supplier = link.supplier;
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
              {link.is_direct && (
                <Badge variant="default" className="text-[10px] py-0 px-1">
                  Principal
                </Badge>
              )}
              {link.is_preferred && !link.is_direct && (
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
