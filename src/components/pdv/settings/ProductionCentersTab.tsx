import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductionCenters, ProductionCenter } from "@/hooks/use-production-centers";
import { Plus, Edit, Trash2, Printer, Info, ChefHat, Wine, Coffee, Cake, Pizza, Soup, Sandwich, IceCream, Beer, Utensils, MoreVertical, Settings } from "lucide-react";
import { ProductionCenterDialog } from "./ProductionCenterDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum centro de produção cadastrado</p>
            <p className="text-sm">Clique em "Novo Centro" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <Card key={center.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${center.color}20` }}
                >
                  <CenterIcon name={center.icon} color={center.color} className="h-6 w-6" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(center)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingCenter(center)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="flex-1 space-y-2 pb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">{center.name}</CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">
                    {center.slug}
                  </Badge>
                </div>
                {center.printer_name ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{center.printer_name}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    Sem impressora configurada
                  </p>
                )}
              </CardContent>

              <div className="border-t">
                <button
                  onClick={() => handleEdit(center)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors rounded-b-lg"
                >
                  <Settings className="h-4 w-4" />
                  Configurar impressora
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
