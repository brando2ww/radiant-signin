import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDeliveryProducts } from "@/hooks/use-delivery-products";
import { useProductOptions, useImportProductOptions } from "@/hooks/use-product-options";
import { Loader2 } from "lucide-react";

interface ImportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetProductId: string;
}

export const ImportOptionsDialog = ({
  open,
  onOpenChange,
  targetProductId,
}: ImportOptionsDialogProps) => {
  const [sourceProductId, setSourceProductId] = useState<string>("none");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: products = [] } = useDeliveryProducts();
  const { data: options = [], isLoading } = useProductOptions(
    sourceProductId !== "none" ? sourceProductId : undefined,
  );
  const importOptions = useImportProductOptions();

  useEffect(() => {
    if (!open) {
      setSourceProductId("none");
      setSelectedIds([]);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIds([]);
  }, [sourceProductId]);

  const otherProducts = products.filter((p) => p.id !== targetProductId);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleImport = () => {
    importOptions.mutate(
      { targetProductId, sourceOptionIds: selectedIds },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar opções de outro produto</DialogTitle>
          <DialogDescription>
            Selecione um produto e as opções que deseja copiar para este produto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Produto de origem</Label>
            <Select value={sourceProductId} onValueChange={setSourceProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>
                  Selecione um produto
                </SelectItem>
                {otherProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourceProductId !== "none" && (
            <div className="space-y-2">
              <Label>Opções disponíveis</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : options.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Este produto não possui opções cadastradas.
                </p>
              ) : (
                <ScrollArea className="max-h-[300px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {options.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedIds.includes(opt.id)}
                          onCheckedChange={() => toggle(opt.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{opt.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {opt.items?.length || 0} {opt.items?.length === 1 ? "item" : "itens"} •{" "}
                            {opt.type === "single" ? "Escolha única" : "Múltipla escolha"}
                            {opt.is_required && " • Obrigatória"}
                          </div>
                        </div>
                        {opt.items?.some((i: any) => i.ingredient_id) && (
                          <Badge variant="outline" className="text-xs">
                            Ficha técnica
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.length === 0 || importOptions.isPending}
          >
            {importOptions.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
