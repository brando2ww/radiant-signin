import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutList, Columns3, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DailyFilters {
  shift: string;
  sector: string;
  operator: string;
  status: string;
  viewMode: "list" | "kanban";
}

interface Props {
  filters: DailyFilters;
  onChange: (f: DailyFilters) => void;
  operators: { id: string; name: string }[];
}

const SHIFTS = ["Todos", "Abertura", "Tarde", "Fechamento"];
const SECTORS = [
  { value: "all", label: "Todos os setores" },
  { value: "cozinha", label: "Cozinha" },
  { value: "salao", label: "Salão" },
  { value: "caixa", label: "Caixa" },
  { value: "bar", label: "Bar" },
  { value: "estoque", label: "Estoque" },
  { value: "gerencia", label: "Gerência" },
];
const STATUSES = [
  { value: "all", label: "Todos os status" },
  { value: "pending", label: "Pendentes" },
  { value: "overdue", label: "Atrasadas" },
  { value: "in_progress", label: "Em andamento" },
  { value: "done", label: "Concluídas" },
];

export function DailyTaskFilters({ filters, onChange, operators }: Props) {
  const set = (partial: Partial<DailyFilters>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Shift buttons */}
      <div className="flex gap-1">
        {SHIFTS.map(s => (
          <Button
            key={s}
            size="sm"
            variant={filters.shift === s ? "default" : "outline"}
            onClick={() => set({ shift: s })}
            className="text-xs h-8"
          >
            {s}
          </Button>
        ))}
      </div>

      <Select value={filters.sector} onValueChange={v => set({ sector: v })}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SECTORS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.operator} onValueChange={v => set({ operator: v })}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos responsáveis</SelectItem>
          {operators.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={v => set({ status: v })}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* View toggle */}
      <div className="flex gap-0.5 ml-auto border rounded-md p-0.5">
        <Button
          size="icon"
          variant={filters.viewMode === "list" ? "default" : "ghost"}
          className="h-7 w-7"
          onClick={() => set({ viewMode: "list" })}
        >
          <LayoutList className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant={filters.viewMode === "kanban" ? "default" : "ghost"}
          className="h-7 w-7"
          onClick={() => set({ viewMode: "kanban" })}
        >
          <Columns3 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
