import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, ChevronRight, Library, QrCode, Printer } from "lucide-react";
import { useChecklists, SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { TemplateLibraryDialog } from "./TemplateLibraryDialog";
import { ChecklistQrPosterDialog } from "./ChecklistQrPosterDialog";
import { BatchQrPosterDialog } from "./BatchQrPosterDialog";
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
  const [templateLibOpen, setTemplateLibOpen] = useState(false);
  const [batchQrOpen, setBatchQrOpen] = useState(false);
  const [qrChecklist, setQrChecklist] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const sectorColor: Record<ChecklistSector, string> = {
    cozinha: "bg-orange-100 text-orange-800",
    salao: "bg-blue-100 text-blue-800",
    caixa: "bg-green-100 text-green-800",
    bar: "bg-purple-100 text-purple-800",
    estoque: "bg-yellow-100 text-yellow-800",
    gerencia: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => navigate("/pdv/tarefas/checklists/novo")}>
          <Plus className="h-4 w-4 mr-2" /> Novo Checklist
        </Button>
        <Button variant="outline" size="sm" onClick={() => setTemplateLibOpen(true)}>
          <Library className="h-4 w-4 mr-2" /> Templates Prontos
        </Button>
        <Button variant="outline" size="sm" onClick={() => setBatchQrOpen(true)}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir QR Codes do Setor
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
            <Card
              key={cl.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/pdv/tarefas/checklists/${cl.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {(cl as any).color && (
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: (cl as any).color }}
                        />
                      )}
                      <CardTitle className="text-base">{cl.name}</CardTitle>
                    </div>
                    <Badge className={sectorColor[cl.sector]} variant="secondary">
                      {SECTOR_LABELS[cl.sector]}
                    </Badge>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="QR Code"
                      onClick={() => setQrChecklist(cl)}
                    >
                      <QrCode className="h-3.5 w-3.5" />
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="h-3.5 w-3.5" />
                  Clique para editar
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateLibraryDialog open={templateLibOpen} onOpenChange={setTemplateLibOpen} />

      <ChecklistQrPosterDialog
        open={!!qrChecklist}
        onOpenChange={(o) => !o && setQrChecklist(null)}
        checklist={qrChecklist}
      />

      <BatchQrPosterDialog
        open={batchQrOpen}
        onOpenChange={setBatchQrOpen}
        checklists={checklists as any}
      />

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
