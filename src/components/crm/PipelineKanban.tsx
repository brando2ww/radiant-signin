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
  onConvertLead: (lead: Lead) => void;
  onLostLead: (lead: Lead) => void;
}

const STAGES = [
  { id: 'incoming', name: 'Novos Leads', color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' },
  { id: 'first_contact', name: 'Primeiro Contato', color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
  { id: 'discussion', name: 'Em Discussão', color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' },
  { id: 'negotiation', name: 'Negociação', color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800' },
  { id: 'won', name: 'Ganhos', color: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  { id: 'lost', name: 'Perdidos', color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
];

export function PipelineKanban({
  leads,
  onEditLead,
  onDeleteLead,
  onViewDetails,
  onConvertLead,
  onLostLead,
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
      const lead = leads.find((l) => l.id === leadId);
      
      if (!lead) {
        setActiveLead(null);
        return;
      }

      // Intercept won/lost stages to open dialogs
      if (newStage === 'won') {
        onConvertLead(lead);
        setActiveLead(null);
        return;
      }
      
      if (newStage === 'lost') {
        onLostLead(lead);
        setActiveLead(null);
        return;
      }

      // Normal stage movement
      moveLeadMutation.mutate({ leadId, newStage });
    }
    
    setActiveLead(null);
  };

  const getLeadsByStage = (stageId: string) => {
    if (stageId === 'won' || stageId === 'lost') {
      // For won/lost, show leads with status converted/archived
      return leads.filter((lead) => lead.stage === stageId);
    }
    return leads.filter((lead) => lead.stage === stageId);
  };

  // Get all leads including won/lost from full data
  const getAllLeads = () => leads;

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
          <div className="w-[320px]">
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
