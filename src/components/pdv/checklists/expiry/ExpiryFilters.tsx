import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Search } from "lucide-react";
import { CATEGORIES, STORAGE_LOCATIONS } from "@/hooks/use-product-expiry";

export interface ExpiryFilterState {
  search: string;
  category: string;
  storageLocation: string;
  status: string;
  viewMode: "table" | "cards";
}

interface Props {
  filters: ExpiryFilterState;
  onChange: (f: ExpiryFilterState) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "valido", label: "OK" },
  { value: "proximo_vencimento", label: "Atenção (≤3 dias)" },
  { value: "critico", label: "Crítico (≤1 dia)" },
  { value: "vencido", label: "Vencido" },
];

export function ExpiryFilters({ filters, onChange }: Props) {
  const set = (partial: Partial<ExpiryFilterState>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto ou lote..."
          className="pl-8 h-9"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <Select value={filters.category} onValueChange={(v) => set({ category: v })}>
        <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.storageLocation} onValueChange={(v) => set({ storageLocation: v })}>
        <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Local" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {STORAGE_LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => set({ status: v })}>
        <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex border rounded-md">
        <Button variant={filters.viewMode === "table" ? "secondary" : "ghost"} size="sm" className="h-9 px-2" onClick={() => set({ viewMode: "table" })}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant={filters.viewMode === "cards" ? "secondary" : "ghost"} size="sm" className="h-9 px-2" onClick={() => set({ viewMode: "cards" })}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
