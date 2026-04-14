import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { OperatorDialog } from "./OperatorDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ACCESS_LABELS: Record<string, string> = {
  operador: "Operador",
  lider: "Líder",
  gestor: "Gestor",
};

export function OperatorsManager() {
  const { operators, isLoading, deleteOperator } = useChecklistOperators();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={() => { setEditingId(null); setDialogOpen(true); }}>
        <Plus className="h-4 w-4 mr-2" /> Novo Colaborador
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : operators.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum colaborador cadastrado. Cadastre para atribuir checklists.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {operators.map((op) => (
            <Card key={op.id} className={!op.is_active ? "opacity-50" : ""}>
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{op.name}</span>
                    <Badge variant="secondary">{op.role}</Badge>
                    <Badge variant="outline">{SECTOR_LABELS[op.sector as ChecklistSector] || op.sector}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {ACCESS_LABELS[op.access_level] || op.access_level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <KeyRound className="h-3 w-3" /> PIN: {op.pin}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(op.id); setDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(op.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OperatorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        operators={operators}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover colaborador?</AlertDialogTitle>
            <AlertDialogDescription>O colaborador será removido dos agendamentos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteOperator(deleteId); setDeleteId(null); }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
