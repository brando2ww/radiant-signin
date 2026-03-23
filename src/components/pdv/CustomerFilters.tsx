import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (v: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function CustomerFilters({ search, onSearchChange, sourceFilter, onSourceFilterChange, totalCount, filteredCount }: CustomerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pdv">PDV</SelectItem>
          <SelectItem value="delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {filteredCount} de {totalCount} clientes
      </span>
    </div>
  );
}
