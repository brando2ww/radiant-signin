import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Lead, useMoveLeadToStage } from "@/hooks/use-crm-leads";
import { PipelineColumn } from "./PipelineColumn";
import { LeadCard } from "./LeadCard";

interface PipelineKanbanProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
}

const STAGES = [
  { id: 'incoming', name: 'Novos Leads', color: 'bg-blue-50 border-blue-200' },
  { id: 'first_contact', name: 'Primeiro Contato', color: 'bg-amber-50 border-amber-200' },
  { id: 'discussion', name: 'Em Discussão', color: 'bg-purple-50 border-purple-200' },
  { id: 'negotiation', name: 'Negociação', color: 'bg-green-50 border-green-200' },
];

export function PipelineKanban({
  leads,
  onEditLead,
  onDeleteLead,
  onViewDetails,
}: PipelineKanbanProps) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const moveLeadMutation = useMoveLeadToStage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) {
      setActiveLead(lead);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const leadId = active.id as string;
      const newStage = over.id as string;
      
      moveLeadMutation.mutate({ leadId, newStage });
    }
    
    setActiveLead(null);
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter((lead) => lead.stage === stageId);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={getLeadsByStage(stage.id)}
            onEditLead={onEditLead}
            onDeleteLead={onDeleteLead}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLead && (
          <div className="opacity-90">
            <LeadCard
              lead={activeLead}
              onEdit={() => {}}
              onDelete={() => {}}
              onViewDetails={() => {}}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
