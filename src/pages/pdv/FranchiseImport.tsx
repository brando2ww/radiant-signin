import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Armchair, Truck, RefreshCw, GitBranch, Info, Loader2 } from "lucide-react";
import { useFranchiseImport } from "@/hooks/use-franchise-import";

export default function FranchiseImport() {
  const {
    hasParentTenant,
    parentTenant,
    parentProducts,
    parentTables,
    importedProductIds,
    importedTableIds,
    importProducts,
    importTables,
    importDeliverySettings,
    syncExisting,
    isLoading,
    loadingProducts,
    loadingTables,
  } = useFranchiseImport();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasParentTenant) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Info className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Sem conexão com franquia</h2>
            <p className="text-muted-foreground text-center text-sm max-w-md">
              Este estabelecimento não está vinculado a nenhuma matriz/franquia.
              Entre em contato com o administrador para vincular.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableProducts = parentProducts.filter((p) => !importedProductIds.includes(p.id));
  const availableTables = parentTables.filter((t) => !importedTableIds.includes(t.id));

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTable = (id: string) => {
    setSelectedTables((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(availableProducts.map((p) => p.id));
    }
  };

  const selectAllTables = () => {
    if (selectedTables.length === availableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(availableTables.map((t) => t.id));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Franquia — Importar da Matriz</h1>
          <p className="text-muted-foreground text-sm">
            Conectado a: <span className="font-medium text-foreground">{parentTenant?.name}</span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Produtos da Matriz</CardTitle>
            </div>
            <Badge variant="secondary">
              {importedProductIds.length} já importado(s)
            </Badge>
          </div>
          <CardDescription>
            Selecione os produtos que deseja importar para o seu catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProducts ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Todos os produtos já foram importados ✓
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  checked={selectedProducts.length === availableProducts.length && availableProducts.length > 0}
                  onCheckedChange={selectAllProducts}
                />
                <span className="text-sm text-muted-foreground">Selecionar todos ({availableProducts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {availableProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    {product.price_balcao && (
                      <span className="text-xs text-muted-foreground">
                        R$ {Number(product.price_balcao).toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    importProducts.mutate(selectedProducts);
                    setSelectedProducts([]);
                  }}
                  disabled={selectedProducts.length === 0 || importProducts.isPending}
                >
                  {importProducts.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Importar {selectedProducts.length} Produto(s)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Armchair className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Mesas da Matriz</CardTitle>
            </div>
            <Badge variant="secondary">
              {importedTableIds.length} já importada(s)
            </Badge>
          </div>
          <CardDescription>
            Importe o layout de mesas da matriz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTables ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableTables.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Todas as mesas já foram importadas ✓
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  checked={selectedTables.length === availableTables.length && availableTables.length > 0}
                  onCheckedChange={selectAllTables}
                />
                <span className="text-sm text-muted-foreground">Selecionar todas ({availableTables.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableTables.map((table) => (
                  <label
                    key={table.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedTables.includes(table.id)}
                      onCheckedChange={() => toggleTable(table.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">Mesa {table.table_number}</p>
                      <p className="text-xs text-muted-foreground">{table.capacity} lugares</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => {
                    importTables.mutate(selectedTables);
                    setSelectedTables([]);
                  }}
                  disabled={selectedTables.length === 0 || importTables.isPending}
                >
                  {importTables.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Importar {selectedTables.length} Mesa(s)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Configurações de Delivery</CardTitle>
          </div>
          <CardDescription>
            Importar horários, zonas de entrega, taxas e formas de pagamento da matriz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => importDeliverySettings.mutate()}
            disabled={importDeliverySettings.isPending}
            variant="outline"
          >
            {importDeliverySettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Sync */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sincronizar Produtos</CardTitle>
          </div>
          <CardDescription>
            Atualizar produtos já importados com as versões mais recentes da matriz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => syncExisting.mutate()}
            disabled={syncExisting.isPending || importedProductIds.length === 0}
          >
            {syncExisting.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Sincronizar {importedProductIds.length} Produto(s)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
