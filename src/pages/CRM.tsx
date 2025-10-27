import { useState } from "react";
import { SessionNavBar } from "@/components/ui/sidebar";
import { CRMHeader } from "@/components/crm/CRMHeader";
import { PipelineKanban } from "@/components/crm/PipelineKanban";
import { LeadDialog } from "@/components/crm/LeadDialog";
import { LeadDetailPanel } from "@/components/crm/LeadDetailPanel";
import { useLeads, Lead, useDeleteLead } from "@/hooks/use-crm-leads";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function CRM() {
  const { data: leads, isLoading } = useLeads();
  const deleteLead = useDeleteLead();

  const [searchQuery, setSearchQuery] = useState("");
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

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
      <div className="flex h-screen w-full">
        <SessionNavBar />
        <main className="flex-1 overflow-y-auto ml-12">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando CRM...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-6 ml-12">
        <div className="space-y-6">
          <CRMHeader onNewLead={handleNewLead} onSearch={setSearchQuery} />

          <PipelineKanban
            leads={filteredLeads}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onViewDetails={handleViewDetails}
          />
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
      </main>
    </div>
  );
}
