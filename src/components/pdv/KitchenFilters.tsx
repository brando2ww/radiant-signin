import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";

interface KitchenFiltersProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  counts: {
    total: number;
    pendente: number;
    preparando: number;
    pronto: number;
  };
}

const STATUS_FILTERS = [
  { value: null, label: "Todos", icon: null },
  { value: "pendente", label: "Pendentes", icon: Clock },
  { value: "preparando", label: "Preparando", icon: ChefHat },
  { value: "pronto", label: "Prontos", icon: CheckCircle2 },
];

export function KitchenFilters({
  selectedStatus,
  onStatusChange,
  counts,
}: KitchenFiltersProps) {
  const getCount = (status: string | null) => {
    if (status === null) return counts.total;
    return counts[status as keyof typeof counts] || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedStatus === filter.value;
          const count = getCount(filter.value);

          return (
            <Button
              key={filter.value || "all"}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(filter.value)}
              className="gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              {filter.label}
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="ml-1"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {counts.total} {counts.total === 1 ? "item" : "itens"} na cozinha
        </span>
        {counts.pendente > 0 && (
          <span className="font-medium text-destructive">
            {counts.pendente} {counts.pendente === 1 ? "aguardando" : "aguardando"}
          </span>
        )}
      </div>
    </div>
  );
}
