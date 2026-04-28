import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings2, Download } from "lucide-react";
import { ProductOptionCard } from "./ProductOptionCard";
import { ProductOptionDialog } from "./ProductOptionDialog";
import { ImportOptionsDialog } from "./ImportOptionsDialog";
import {
  useProductOptions,
  useCreateProductOption,
  useFullUpdateProductOption,
  useDeleteProductOption,
  ProductOption,
} from "@/hooks/use-product-options";
import { Badge } from "@/components/ui/badge";

interface ProductOptionsManagerProps {
  productId?: string;
}

export const ProductOptionsManager = ({ productId }: ProductOptionsManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | undefined>();

  const { data: options = [], isLoading } = useProductOptions(productId);
  const createOption = useCreateProductOption();
  const fullUpdateOption = useFullUpdateProductOption();
  const deleteOption = useDeleteProductOption();

  const handleSaveOption = (optionData: any) => {
    if (editingOption) {
      fullUpdateOption.mutate({
        optionId: editingOption.id,
        optionData,
      });
    } else {
      createOption.mutate(optionData);
    }
    setEditingOption(undefined);
  };

  const handleEditOption = (option: ProductOption) => {
    setEditingOption(option);
    setIsDialogOpen(true);
  };

  const handleDeleteOption = (optionId: string) => {
    if (productId) {
      deleteOption.mutate({ id: optionId, productId });
    }
  };

  const handleNewOption = () => {
    setEditingOption(undefined);
    setIsDialogOpen(true);
  };

  if (!productId) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Salve o produto primeiro para gerenciar opções
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <span>Opções e Complementos</span>
              {options.length > 0 && (
                <Badge variant="secondary">{options.length}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Importar opções
              </Button>
              <Button size="sm" onClick={handleNewOption}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Opção
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">Carregando opções...</p>
          ) : options.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">
                Nenhuma opção configurada para este produto
              </p>
              <p className="text-sm text-muted-foreground">
                Adicione opções como tamanhos, adicionais, complementos, etc.
              </p>
            </div>
          ) : (
            options.map((option) => (
              <ProductOptionCard
                key={option.id}
                option={option}
                onEdit={() => handleEditOption(option)}
                onDelete={() => handleDeleteOption(option.id)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {productId && (
        <>
          <ProductOptionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            option={editingOption}
            productId={productId}
            onSave={handleSaveOption}
          />
          <ImportOptionsDialog
            open={isImportOpen}
            onOpenChange={setIsImportOpen}
            targetProductId={productId}
          />
        </>
      )}
    </>
  );
};
