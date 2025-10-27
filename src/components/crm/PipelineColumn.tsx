import { useDroppable } from "@dnd-kit/core";
import { Lead } from "@/hooks/use-crm-leads";
import { LeadCard } from "./LeadCard";
import { Card } from "@/components/ui/card";

interface PipelineColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
}

export function PipelineColumn({
  stage,
  leads,
  onEditLead,
  onDeleteLead,
  onViewDetails,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      <Card className={`p-4 mb-3 ${stage.color}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <span className="text-xs bg-background px-2 py-1 rounded-full font-medium">
            {leads.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(totalValue)}
        </p>
      </Card>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
          isOver ? 'bg-muted/50' : ''
        }`}
      >
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={() => onEditLead(lead)}
            onDelete={() => onDeleteLead(lead)}
            onViewDetails={() => onViewDetails(lead)}
          />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum lead neste estágio
          </div>
        )}
      </div>
    </div>
  );
}
