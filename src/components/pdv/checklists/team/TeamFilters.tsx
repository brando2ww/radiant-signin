import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { Search } from "lucide-react";

const ACCESS_OPTIONS = [
  { value: "all", label: "Todos os níveis" },
  { value: "operador", label: "Operador" },
  { value: "lider", label: "Líder" },
  { value: "gestor", label: "Gestor" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "sector", label: "Setor" },
  { value: "access", label: "Acesso" },
];

export interface TeamFilterState {
  search: string;
  sector: string;
  access: string;
  status: string;
  sort: string;
}

interface Props {
  filters: TeamFilterState;
  onChange: (f: TeamFilterState) => void;
}

export function TeamFilters({ filters, onChange }: Props) {
  const set = (key: keyof TeamFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filters.sector} onValueChange={(v) => set("sector", v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Setor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
            <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.access} onValueChange={(v) => set("access", v)}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Acesso" /></SelectTrigger>
        <SelectContent>
          {ACCESS_OPTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.sort} onValueChange={(v) => set("sort", v)}>
        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Ordenar" /></SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
