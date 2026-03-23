import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Camera } from "lucide-react";
import { useOperationalTasks, type TaskTemplate, type ShiftConfig } from "@/hooks/use-operational-tasks";
import { TaskTemplateDialog } from "./TaskTemplateDialog";
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

interface Props {
  templates: TaskTemplate[];
  shifts: ShiftConfig[];
}

export function TaskTemplatesManager({ templates, shifts }: Props) {
  const { updateTemplate, deleteTemplate } = useOperationalTasks();
  const [editTemplate, setEditTemplate] = useState<TaskTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const grouped = shifts.map((shift) => ({
    shift,
    tasks: templates.filter((t) => t.shift === shift.name.toLowerCase() || t.shift === shift.name),
  }));

  return (
    <div className="space-y-4">
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Nenhum template de tarefa cadastrado.</p>
            <p className="text-sm mt-1">Crie templates para gerar tarefas automaticamente todos os dias.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.filter((g) => g.tasks.length > 0).map(({ shift, tasks }) => (
          <Card key={shift.name}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">{shift.name} ({shift.start} - {shift.end})</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-0 space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {t.assignedTo && <Badge variant="outline" className="text-xs">{t.assignedTo}</Badge>}
                      {t.requiresPhoto && <Camera className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <Switch
                    checked={t.isActive}
                    onCheckedChange={(v) => updateTemplate({ id: t.id, isActive: v })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => setEditTemplate(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {editTemplate && (
        <TaskTemplateDialog
          open={!!editTemplate}
          onOpenChange={() => setEditTemplate(null)}
          shifts={shifts}
          template={editTemplate}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As tarefas já geradas não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteTemplate(deleteId); setDeleteId(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
