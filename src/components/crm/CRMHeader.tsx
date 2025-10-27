import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCRMStats } from "@/hooks/use-crm-stats";

interface CRMHeaderProps {
  onNewLead: () => void;
  onSearch: (query: string) => void;
}

export function CRMHeader({ onNewLead, onSearch }: CRMHeaderProps) {
  const { data: stats } = useCRMStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-muted-foreground">Gestão de leads e oportunidades</p>
        </div>
        <Button onClick={onNewLead}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de Leads</p>
          <p className="text-2xl font-bold">{stats?.totalLeads || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Valor do Pipeline</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(stats?.totalValue || 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-2xl font-bold">
            {formatCurrency(stats?.averageDealSize || 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          <p className="text-2xl font-bold text-green-600">
            {stats?.conversionRate?.toFixed(1) || 0}%
          </p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar leads por nome, empresa ou projeto..."
          className="pl-9"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
