import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductionCenters, ProductionCenter } from "@/hooks/use-production-centers";
import { Plus, Edit, Trash2, Printer, Info, ChefHat, Wine, Coffee, Cake, Pizza, Soup, Sandwich, IceCream, Beer, Utensils } from "lucide-react";
import { ProductionCenterDialog } from "./ProductionCenterDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ICON_MAP: Record<string, any> = {
  ChefHat, Wine, Coffee, Cake, Pizza, Soup, Sandwich, IceCream, Beer, Utensils,
};

function CenterIcon({ name, color, className }: { name: string; color: string; className?: string }) {
  const Icon = ICON_MAP[name] || ChefHat;
  return <Icon className={className} style={{ color }} />;
}

export function ProductionCentersTab() {
  const { centers, isLoading, deleteCenter, isDeleting } = useProductionCenters();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ProductionCenter | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<ProductionCenter | null>(null);

  const handleEdit = (center: ProductionCenter) => {
    setEditingCenter(center);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCenter(null);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCenter) return;
    await deleteCenter(deletingCenter.id);
    setDeletingCenter(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Centros de Produção
          </CardTitle>
          <CardDescription>
            Configure as bancadas/estações de preparo do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Cada produto é roteado para um centro específico. Quando o garçom lança a comanda,
              os itens são impressos automaticamente na bancada correspondente
              (ex: sashimi vai pro Sushi Bar, drinks vão pro Bar).
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro
            </Button>
          </div>

          {centers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum centro de produção cadastrado</p>
              <p className="text-sm">Clique em "Novo Centro" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {centers.map((center) => (
                <div
                  key={center.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${center.color}20` }}
                  >
                    <CenterIcon name={center.icon} color={center.color} className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{center.name}</p>
                      <Badge variant="outline" className="text-xs font-mono">
                        {center.slug}
                      </Badge>
                    </div>
                    {center.printer_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Printer className="h-3 w-3" />
                        {center.printer_name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(center)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCenter(center)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductionCenterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        center={editingCenter}
      />

      <AlertDialog open={!!deletingCenter} onOpenChange={(o) => !o && setDeletingCenter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover centro de produção?</AlertDialogTitle>
            <AlertDialogDescription>
              Os produtos vinculados a <strong>{deletingCenter?.name}</strong> continuarão
              existindo, mas precisarão ser reatribuídos a outro centro. Esta ação pode ser
              revertida no banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
