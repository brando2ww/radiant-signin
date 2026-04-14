import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Pencil, Trash2, ChevronRight, Library } from "lucide-react";
import { useChecklists, SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { ChecklistDialog } from "./ChecklistDialog";
import { ChecklistItemsEditor } from "./ChecklistItemsEditor";
import { TemplateLibraryDialog } from "./TemplateLibraryDialog";
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

export function ChecklistsManager() {
  const { checklists, isLoading, deleteChecklist, duplicateChecklist } = useChecklists();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateLibOpen, setTemplateLibOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItemsId, setEditingItemsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sectorColor: Record<ChecklistSector, string> = {
    cozinha: "bg-orange-100 text-orange-800",
    salao: "bg-blue-100 text-blue-800",
    caixa: "bg-green-100 text-green-800",
    bar: "bg-purple-100 text-purple-800",
    estoque: "bg-yellow-100 text-yellow-800",
    gerencia: "bg-red-100 text-red-800",
  };

  if (editingItemsId) {
    const cl = checklists.find((c) => c.id === editingItemsId);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditingItemsId(null)}>
            ← Voltar
          </Button>
          <h3 className="font-semibold text-lg">{cl?.name} — Itens</h3>
        </div>
        <ChecklistItemsEditor checklistId={editingItemsId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => { setEditingId(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Novo Checklist
        </Button>
        <Button variant="outline" size="sm" onClick={() => setTemplateLibOpen(true)}>
          <Library className="h-4 w-4 mr-2" /> Templates Prontos
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : checklists.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum checklist criado. Comece criando um novo ou use um template pronto.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {checklists.map((cl) => (
            <Card key={cl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{cl.name}</CardTitle>
                    <Badge className={sectorColor[cl.sector]} variant="secondary">
                      {SECTOR_LABELS[cl.sector]}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(cl.id); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateChecklist(cl.id)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(cl.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {cl.description && <p className="text-sm text-muted-foreground mb-3">{cl.description}</p>}
                <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingItemsId(cl.id)}>
                  Editar Itens <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ChecklistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        checklists={checklists}
      />

      <TemplateLibraryDialog open={templateLibOpen} onOpenChange={setTemplateLibOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os itens e agendamentos vinculados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteChecklist(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
