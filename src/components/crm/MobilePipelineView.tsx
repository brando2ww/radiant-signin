import { useState } from "react";
import { Lead } from "@/hooks/use-crm-leads";
import { LeadCard } from "./LeadCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MobilePipelineViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onConvertLead: (lead: Lead) => void;
  onLostLead: (lead: Lead) => void;
}

const STAGES = [
  { id: 'incoming', name: 'Novos Leads', color: 'bg-blue-500' },
  { id: 'first_contact', name: 'Primeiro Contato', color: 'bg-amber-500' },
  { id: 'discussion', name: 'Em Discussão', color: 'bg-purple-500' },
  { id: 'negotiation', name: 'Negociação', color: 'bg-orange-500' },
  { id: 'won', name: 'Ganhos', color: 'bg-green-500' },
  { id: 'lost', name: 'Perdidos', color: 'bg-red-500' },
];

export function MobilePipelineView({
  leads,
  onEditLead,
  onDeleteLead,
  onViewDetails,
  onConvertLead,
  onLostLead,
}: MobilePipelineViewProps) {
  const [selectedStage, setSelectedStage] = useState('incoming');

  const getLeadsByStage = (stageId: string) => {
    return leads.filter((lead) => lead.stage === stageId);
  };

  const currentStage = STAGES.find(s => s.id === selectedStage);
  const stageLeads = getLeadsByStage(selectedStage);

  const getStageCount = (stageId: string) => {
    return leads.filter(l => l.stage === stageId).length;
  };

  return (
    <div className="space-y-4">
      {/* Stage Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o estágio" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span>{stage.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {getStageCount(stage.id)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stage Pills for quick navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedStage === stage.id
                ? `${stage.color} text-white`
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span>{stage.name}</span>
            <span className={`text-xs ${selectedStage === stage.id ? 'opacity-80' : ''}`}>
              ({getStageCount(stage.id)})
            </span>
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {stageLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum lead neste estágio</p>
          </div>
        ) : (
          stageLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={() => onEditLead(lead)}
              onDelete={() => onDeleteLead(lead)}
              onViewDetails={() => onViewDetails(lead)}
            />
          ))
        )}
      </div>
    </div>
  );
}
