import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useChecklistSchedules } from "@/hooks/use-checklist-schedules";
import { useChecklists, SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { ScheduleIndicators } from "./schedules/ScheduleIndicators";
import { ScheduleFilters } from "./schedules/ScheduleFilters";
import { ScheduleWeekGrid } from "./schedules/ScheduleWeekGrid";
import { ScheduleListView } from "./schedules/ScheduleListView";
import { ScheduleDrawer } from "./schedules/ScheduleDrawer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SchedulesManager() {
  const { schedules, isLoading, deleteSchedule, duplicateSchedule, toggleSchedule } = useChecklistSchedules();
  const { checklists } = useChecklists();
  const { operators } = useChecklistOperators();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [presetDay, setPresetDay] = useState<number | null>(null);
  const [presetShift, setPresetShift] = useState<string | null>(null);

  const [shiftFilter, setShiftFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = schedules.filter((s: any) => {
    if (shiftFilter !== "all" && s.shift !== shiftFilter) return false;
    if (sectorFilter !== "all" && s.checklists?.sector !== sectorFilter) return false;
    if (operatorFilter !== "all" && s.assigned_operator_id !== operatorFilter) return false;
    if (statusFilter === "active" && !s.is_active) return false;
    if (statusFilter === "paused" && s.is_active) return false;
    return true;
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
    setPresetDay(null);
    setPresetShift(null);
    setDrawerOpen(true);
  };

  const handleCreateAt = (day: number, shift: string) => {
    setEditingId(null);
    setPresetDay(day);
    setPresetShift(shift);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setPresetDay(null);
    setPresetShift(null);
    setDrawerOpen(true);
  };

  const activeOperators = operators.filter((o) => o.is_active).map((o) => ({ id: o.id, name: o.name }));

  return (
    <div className="space-y-4">
      <ScheduleIndicators schedules={schedules} />

      <div className="flex items-center gap-2">
        <ScheduleFilters
          view={view}
          onViewChange={setView}
          shiftFilter={shiftFilter}
          onShiftFilter={setShiftFilter}
          sectorFilter={sectorFilter}
          onSectorFilter={setSectorFilter}
          operatorFilter={operatorFilter}
          onOperatorFilter={setOperatorFilter}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          operators={activeOperators}
        />
        <Button size="sm" onClick={handleNew} className="ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Novo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
      ) : view === "grid" ? (
        <ScheduleWeekGrid schedules={filtered} onEdit={handleEdit} onCreateAt={handleCreateAt} />
      ) : (
        <ScheduleListView
          schedules={filtered}
          onEdit={handleEdit}
          onDuplicate={(id) => duplicateSchedule(id)}
          onToggle={(id) => toggleSchedule(id)}
          onDelete={(id) => setDeleteId(id)}
        />
      )}

      <ScheduleDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editingId={editingId}
        schedules={schedules}
        checklists={checklists}
        operators={operators}
        presetDay={presetDay}
        presetShift={presetShift}
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
