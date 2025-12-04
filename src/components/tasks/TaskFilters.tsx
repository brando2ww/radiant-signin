import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  search: string;
  category: string;
  status: string;
  priority: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  vertical?: boolean;
}

export function TaskFilters({
  search,
  category,
  status,
  priority,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onPriorityChange,
  vertical = false,
}: TaskFiltersProps) {
  return (
    <div className={cn(
      "border-b bg-card",
      vertical ? "p-0 border-0" : "p-4"
    )}>
      <div className={cn(
        vertical 
          ? "flex flex-col gap-4" 
          : "flex flex-wrap items-center gap-3"
      )}>
        <div className={cn("relative", vertical ? "w-full" : "flex-1 min-w-[200px]")}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className={cn(vertical ? "w-full" : "w-full sm:w-auto")}>
          {vertical && <label className="text-sm font-medium mb-1.5 block">Categoria</label>}
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className={cn(vertical ? "w-full" : "w-full sm:w-[140px]")}>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="payment">Pagamento</SelectItem>
              <SelectItem value="meeting">Reunião</SelectItem>
              <SelectItem value="reconciliation">Reconciliação</SelectItem>
              <SelectItem value="administrative">Administrativo</SelectItem>
              <SelectItem value="personal">Pessoal</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={cn(vertical ? "w-full" : "w-full sm:w-auto")}>
          {vertical && <label className="text-sm font-medium mb-1.5 block">Status</label>}
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className={cn(vertical ? "w-full" : "w-full sm:w-[140px]")}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={cn(vertical ? "w-full" : "w-full sm:w-auto")}>
          {vertical && <label className="text-sm font-medium mb-1.5 block">Prioridade</label>}
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger className={cn(vertical ? "w-full" : "w-full sm:w-[140px]")}>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
