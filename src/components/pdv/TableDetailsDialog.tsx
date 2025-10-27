import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Clock, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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

interface TableDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: PDVTable | null;
  orderTotal?: number;
  orderTime?: string;
  onCreateOrder: (tableId: string) => void;
  onViewOrder: (orderId: string) => void;
  onCloseTable: (tableId: string) => void;
  onEditTable: (table: PDVTable) => void;
  onDeleteTable: (tableId: string) => void;
}

const STATUS_CONFIG = {
  livre: { label: "Livre", variant: "secondary" as const },
  ocupada: { label: "Ocupada", variant: "destructive" as const },
  aguardando_pedido: { label: "Aguardando Pedido", variant: "default" as const },
  aguardando_cozinha: { label: "Aguardando Cozinha", variant: "secondary" as const },
  pediu_conta: { label: "Pediu Conta", variant: "default" as const },
  pendente_pagamento: { label: "Pendente Pagamento", variant: "secondary" as const },
};

export function TableDetailsDialog({
  open,
  onOpenChange,
  table,
  orderTotal,
  orderTime,
  onCreateOrder,
  onViewOrder,
  onCloseTable,
  onEditTable,
  onDeleteTable,
}: TableDetailsDialogProps) {
  const [deleteDialog, setDeleteDialog] = useState(false);

  if (!table) return null;

  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.livre;
  const isOccupied = table.status !== "livre";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Mesa {table.table_number}</DialogTitle>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{table.capacity} lugares</span>
            </div>

            {isOccupied && (
              <>
                <Separator />
                <div className="space-y-3">
                  {orderTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Desde {orderTime}
                      </span>
                    </div>
                  )}
                  {orderTotal !== undefined && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Total</span>
                      </div>
                      <span className="text-lg font-bold">
                        R$ {orderTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              {!isOccupied ? (
                <Button
                  className="w-full"
                  onClick={() => {
                    onCreateOrder(table.id);
                    onOpenChange(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Abrir Mesa
                </Button>
              ) : (
                <>
                  {table.current_order_id && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        onViewOrder(table.current_order_id!);
                        onOpenChange(false);
                      }}
                    >
                      Ver Pedido
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onCloseTable(table.id);
                      onOpenChange(false);
                    }}
                  >
                    Fechar Mesa
                  </Button>
                </>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onEditTable(table);
                    onOpenChange(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteDialog(true)}
                  disabled={isOccupied}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a Mesa {table.table_number}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteTable(table.id);
                setDeleteDialog(false);
                onOpenChange(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
