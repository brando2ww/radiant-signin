import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDVSector } from "@/hooks/use-pdv-sectors";

interface SalonFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  totalTables: number;
  filteredCount: number;
  occupiedCount: number;
  availableCount: number;
  sectors?: PDVSector[];
  sectorFilter?: string;
  onSectorFilterChange?: (value: string) => void;
}

export function SalonFilters({
  statusFilter,
  onStatusFilterChange,
  totalTables,
  filteredCount,
  occupiedCount,
  availableCount,
  sectors = [],
  sectorFilter = "all",
  onSectorFilterChange,
}: SalonFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {filteredCount} de {totalTables} mesas
          </Badge>
          <Badge variant="default">
            {occupiedCount} ocupadas
          </Badge>
          <Badge variant="outline">
            {availableCount} livres
          </Badge>
        </div>

        <div className="flex gap-2">
          {onSectorFilterChange && (
            <Select value={sectorFilter} onValueChange={onSectorFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                <SelectItem value="none">Sem setor</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="livre">Livres</SelectItem>
              <SelectItem value="ocupada">Ocupadas</SelectItem>
              <SelectItem value="aguardando_pedido">Aguardando Pedido</SelectItem>
              <SelectItem value="aguardando_cozinha">Na Cozinha</SelectItem>
              <SelectItem value="pediu_conta">Pediu Conta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
