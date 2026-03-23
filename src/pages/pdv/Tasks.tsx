import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QrCode, Plus, RefreshCw, Send } from "lucide-react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { DailyTasksView } from "@/components/pdv/tasks/DailyTasksView";
import { TaskTemplatesManager } from "@/components/pdv/tasks/TaskTemplatesManager";
import { TaskHistory } from "@/components/pdv/tasks/TaskHistory";
import { TaskSettings } from "@/components/pdv/tasks/TaskSettings";
import { TaskQRCodeDialog } from "@/components/pdv/tasks/TaskQRCodeDialog";
import { TaskTemplateDialog } from "@/components/pdv/tasks/TaskTemplateDialog";
import { useOperationalTasks } from "@/hooks/use-operational-tasks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function Tasks() {
  const [qrOpen, setQrOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const { user } = useAuth();
  const {
    templates,
    instances,
    settings,
    generateDaily: generateDailyFn,
    isGenerating,
    loadingInstances,
  } = useOperationalTasks();

  const handleSendReport = async () => {
    if (!user?.id) return;
    setSendingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-tasks-report", {
        body: { user_id: user.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Relatório enviado!", description: "O resumo das tarefas foi enviado via WhatsApp." });
    } catch (err: any) {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Tarefas Operacionais"
        description="Checklist diário por turnos para sua equipe"
      >
        <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
          <QrCode className="h-4 w-4 mr-2" /> QR Code
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendReport}
          disabled={sendingReport}
        >
          <Send className={`h-4 w-4 mr-2 ${sendingReport ? "animate-pulse" : ""}`} />
          Enviar Relatório
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateDailyFn(undefined)}
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          Gerar Tarefas do Dia
        </Button>
        <Button size="sm" onClick={() => setTemplateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nova Tarefa
        </Button>
      </ResponsivePageHeader>

      <Tabs defaultValue="hoje">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="mt-4">
          <DailyTasksView instances={instances} shifts={settings.shifts} isLoading={loadingInstances} />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TaskTemplatesManager templates={templates} shifts={settings.shifts} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <TaskHistory shifts={settings.shifts} />
        </TabsContent>
        <TabsContent value="configuracoes" className="mt-4">
          <TaskSettings />
        </TabsContent>
      </Tabs>

      <TaskQRCodeDialog open={qrOpen} onOpenChange={setQrOpen} />
      <TaskTemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        shifts={settings.shifts}
      />
    </div>
  );
}
