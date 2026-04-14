import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";

const SHIFT_OPTIONS = [
  { value: "all", label: "Todos os turnos" },
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

interface Props {
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  shiftFilter: string;
  onShiftFilter: (v: string) => void;
  sectorFilter: string;
  onSectorFilter: (v: string) => void;
  operatorFilter: string;
  onOperatorFilter: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  operators: { id: string; name: string }[];
}

export function ScheduleFilters({
  view, onViewChange, shiftFilter, onShiftFilter,
  sectorFilter, onSectorFilter, operatorFilter, onOperatorFilter,
  statusFilter, onStatusFilter, operators,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 border rounded-lg p-0.5">
        {SHIFT_OPTIONS.map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={shiftFilter === s.value ? "default" : "ghost"}
            className="h-7 text-xs px-2"
            onClick={() => onShiftFilter(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Select value={sectorFilter} onValueChange={onSectorFilter}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos setores</SelectItem>
          {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
            <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={operatorFilter} onValueChange={onOperatorFilter}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Colaborador" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {operators.map((o) => (
            <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilter}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="paused">Pausados</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex gap-1 border rounded-lg p-0.5">
        <Button size="icon" variant={view === "grid" ? "default" : "ghost"} className="h-7 w-7" onClick={() => onViewChange("grid")}>
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant={view === "list" ? "default" : "ghost"} className="h-7 w-7" onClick={() => onViewChange("list")}>
          <List className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
