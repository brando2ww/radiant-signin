import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { useChecklistSchedules } from "@/hooks/use-checklist-schedules";
import { useChecklists, SECTOR_LABELS } from "@/hooks/use-checklists";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { ScheduleDialog } from "./ScheduleDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SHIFT_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export function SchedulesManager() {
  const { schedules, isLoading, deleteSchedule } = useChecklistSchedules();
  const { checklists } = useChecklists();
  const { operators } = useChecklistOperators();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={() => { setEditingId(null); setDialogOpen(true); }}>
        <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
      </Button>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum agendamento. Crie um checklist primeiro e depois agende.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((s: any) => {
            const days = (s.days_of_week as number[]) || [];
            return (
              <Card key={s.id}>
                <CardContent className="py-3 px-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.checklists?.name || "Checklist"}</span>
                      <Badge variant="secondary">{SHIFT_LABELS[s.shift] || s.shift}</Badge>
                      {s.checklists?.sector && (
                        <Badge variant="outline">{SECTOR_LABELS[s.checklists.sector as keyof typeof SECTOR_LABELS]}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.start_time?.slice(0, 5)} ({s.max_duration_minutes}min)
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {days.map((d: number) => DAY_LABELS[d]).join(", ")}
                      </span>
                    </div>
                    {s.checklist_operators?.name && (
                      <p className="text-xs text-muted-foreground">→ {s.checklist_operators.name}</p>
                    )}
                    {s.assigned_sector && !s.assigned_operator_id && (
                      <p className="text-xs text-muted-foreground">→ Setor: {SECTOR_LABELS[s.assigned_sector as keyof typeof SECTOR_LABELS]}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(s.id); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        schedules={schedules}
        checklists={checklists}
        operators={operators}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteSchedule(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
