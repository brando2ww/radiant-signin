import { useState } from "react";
import { CRMHeader } from "@/components/crm/CRMHeader";
import { PipelineKanban } from "@/components/crm/PipelineKanban";
import { LeadDialog } from "@/components/crm/LeadDialog";
import { LeadDetailPanel } from "@/components/crm/LeadDetailPanel";
import { ConvertLeadDialog } from "@/components/crm/ConvertLeadDialog";
import { LostLeadDialog } from "@/components/crm/LostLeadDialog";
import { useLeads, Lead, useDeleteLead } from "@/hooks/use-crm-leads";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePipelineView } from "@/components/crm/MobilePipelineView";

export default function CRM() {
  const isMobile = useIsMobile();
  const { data: leads, isLoading } = useLeads();
  const deleteLead = useDeleteLead();

  const [searchQuery, setSearchQuery] = useState("");
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  const handleNewLead = () => {
    setSelectedLead(null);
    setLeadDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailPanelOpen(false);
    setLeadDialogOpen(true);
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead.mutate(leadToDelete.id);
      setDeleteDialogOpen(false);
      setDetailPanelOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailPanelOpen(true);
  };

  const handleConvertLead = (lead: Lead) => {
    setLeadToConvert(lead);
    setConvertDialogOpen(true);
  };

  const handleLostLead = (lead: Lead) => {
    setLeadToConvert(lead);
    setLostDialogOpen(true);
  };

  const filteredLeads = leads?.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query) ||
      lead.project_title.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <AppLayout className="p-4 md:p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando CRM...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        <CRMHeader onNewLead={handleNewLead} onSearch={setSearchQuery} />

        {isMobile ? (
          <MobilePipelineView
            leads={filteredLeads}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onViewDetails={handleViewDetails}
            onConvertLead={handleConvertLead}
            onLostLead={handleLostLead}
          />
        ) : (
          <PipelineKanban
            leads={filteredLeads}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onViewDetails={handleViewDetails}
            onConvertLead={handleConvertLead}
            onLostLead={handleLostLead}
          />
        )}
      </div>

      <LeadDialog
        open={leadDialogOpen}
        onOpenChange={setLeadDialogOpen}
        lead={selectedLead}
      />

      <LeadDetailPanel
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        lead={selectedLead}
        onEdit={() => handleEditLead(selectedLead!)}
        onConvert={() => {
          setDetailPanelOpen(false);
          handleConvertLead(selectedLead!);
        }}
        onLost={() => {
          setDetailPanelOpen(false);
          handleLostLead(selectedLead!);
        }}
      />

      <ConvertLeadDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        lead={leadToConvert}
      />

      <LostLeadDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        lead={leadToConvert}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead "{leadToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
