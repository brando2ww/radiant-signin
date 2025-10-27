import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface IngredientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  totalIngredients: number;
  filteredCount: number;
  lowStockCount: number;
  criticalStockCount: number;
}

export function IngredientFilters({
  search,
  onSearchChange,
  stockStatus,
  onStockStatusChange,
  totalIngredients,
  filteredCount,
  lowStockCount,
  criticalStockCount,
}: IngredientFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar insumos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stockStatus} onValueChange={onStockStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status do estoque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ok">Estoque OK</SelectItem>
            <SelectItem value="low">Estoque Baixo</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          {filteredCount} de {totalIngredients} insumos
        </Badge>
        {criticalStockCount > 0 && (
          <Badge variant="destructive">
            {criticalStockCount} crítico{criticalStockCount > 1 ? 's' : ''}
          </Badge>
        )}
        {lowStockCount > 0 && (
          <Badge variant="secondary" className="border-yellow-500">
            {lowStockCount} com estoque baixo
          </Badge>
        )}
      </div>
    </div>
  );
}
