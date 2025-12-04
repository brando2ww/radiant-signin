import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeads, Lead } from "@/hooks/use-crm-leads";
import { LeadOverviewTab } from "@/components/crm/LeadOverviewTab";
import { LeadInfoTab } from "@/components/crm/LeadInfoTab";
import { LeadActivitiesTab } from "@/components/crm/LeadActivitiesTab";
import { LeadNotesTab } from "@/components/crm/LeadNotesTab";
import { ConvertLeadDialog } from "@/components/crm/ConvertLeadDialog";
import { LostLeadDialog } from "@/components/crm/LostLeadDialog";
import { useUpdateLead } from "@/hooks/use-crm-leads";

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: leads = [] } = useLeads();
  const updateMutation = useUpdateLead();
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);

  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lead não encontrado</h2>
          <Button onClick={() => navigate('/crm')}>
            Voltar para CRM
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkWon = () => {
    setConvertDialogOpen(true);
  };

  const handleMarkLost = () => {
    setLostDialogOpen(true);
  };

  const handleSaveInfo = (updates: Partial<Lead>) => {
    updateMutation.mutate({
      id: lead.id,
      ...updates,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-16 w-16">
          <AvatarImage src={lead.avatar_url} />
          <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">{lead.project_title}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <LeadOverviewTab
            lead={lead}
            onMarkWon={handleMarkWon}
            onMarkLost={handleMarkLost}
          />
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <LeadInfoTab lead={lead} onSave={handleSaveInfo} />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <LeadActivitiesTab leadId={lead.id} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <LeadNotesTab leadId={lead.id} />
        </TabsContent>
      </Tabs>

      <ConvertLeadDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        lead={lead}
      />

      <LostLeadDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        lead={lead}
      />
    </div>
  );
}
