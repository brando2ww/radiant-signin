import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { PDVSector } from "@/hooks/use-pdv-sectors";
import { Trash2, RotateCcw, TableIcon, Layers, Loader2, AlertTriangle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletedTables: PDVTable[];
  deletedSectors: PDVSector[];
  onRestoreTable: (id: string) => void;
  onPermanentDeleteTable: (id: string) => void;
  onRestoreSector: (id: string) => void;
  onPermanentDeleteSector: (id: string) => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

export function TrashDialog({
  open,
  onOpenChange,
  deletedTables,
  deletedSectors,
  onRestoreTable,
  onPermanentDeleteTable,
  onRestoreSector,
  onPermanentDeleteSector,
  isRestoring,
  isDeleting,
}: TrashDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "table" | "sector"; id: string; name: string } | null>(null);

  const totalItems = deletedTables.length + deletedSectors.length;

  const handlePermanentDelete = (type: "table" | "sector", id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmPermanentDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "table") {
      onPermanentDeleteTable(itemToDelete.id);
    } else {
      onPermanentDeleteSector(itemToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Lixeira
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Itens excluídos podem ser restaurados ou removidos permanentemente.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="tables" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                Mesas
                {deletedTables.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {deletedTables.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sectors" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Setores
                {deletedSectors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {deletedSectors.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="mt-4 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {deletedTables.length === 0 ? (
                <EmptyState icon={TableIcon} message="Nenhuma mesa na lixeira" />
              ) : (
                deletedTables.map((table) => (
                  <TrashItem
                    key={table.id}
                    title={`Mesa ${table.table_number}`}
                    subtitle={`${table.capacity} lugares • ${table.shape === "round" ? "Redonda" : "Quadrada"}`}
                    deletedAt={table.deleted_at}
                    onRestore={() => onRestoreTable(table.id)}
                    onDelete={() => handlePermanentDelete("table", table.id, `Mesa ${table.table_number}`)}
                    isRestoring={isRestoring}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="sectors" className="mt-4 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {deletedSectors.length === 0 ? (
                <EmptyState icon={Layers} message="Nenhum setor na lixeira" />
              ) : (
                deletedSectors.map((sector) => (
                  <TrashItem
                    key={sector.id}
                    title={sector.name}
                    subtitle="Setor"
                    color={sector.color}
                    deletedAt={sector.deleted_at}
                    onRestore={() => onRestoreSector(sector.id)}
                    onDelete={() => handlePermanentDelete("sector", sector.id, sector.name)}
                    isRestoring={isRestoring}
                    isDeleting={isDeleting}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente "{itemToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TrashItemProps {
  title: string;
  subtitle: string;
  color?: string;
  deletedAt: string | null;
  onRestore: () => void;
  onDelete: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

function TrashItem({
  title,
  subtitle,
  color,
  deletedAt,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: TrashItemProps) {
  const formattedDate = deletedAt
    ? format(parseISO(deletedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "Data desconhecida";

  // Calcular dias restantes até exclusão automática (30 dias após deleted_at)
  const daysUntilDeletion = deletedAt
    ? Math.max(0, 30 - differenceInDays(new Date(), parseISO(deletedAt)))
    : null;

  const isUrgent = daysUntilDeletion !== null && daysUntilDeletion <= 7;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border bg-card",
      isUrgent && "border-yellow-500/50 bg-yellow-500/5"
    )}>
      {color && (
        <div
          className="h-8 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <p className="text-xs text-muted-foreground">Excluído em {formattedDate}</p>
        {daysUntilDeletion !== null && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            isUrgent ? "text-yellow-600" : "text-muted-foreground"
          )}>
            {isUrgent && <AlertTriangle className="h-3 w-3" />}
            <span>
              {daysUntilDeletion === 0
                ? "Será excluído hoje"
                : `Será excluído em ${daysUntilDeletion} dia${daysUntilDeletion !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={onRestore}
          disabled={isRestoring}
          title="Restaurar"
        >
          {isRestoring ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
          title="Excluir permanentemente"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
