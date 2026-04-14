import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, Send } from "lucide-react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { ChecklistsManager } from "@/components/pdv/checklists/ChecklistsManager";
import { SchedulesManager } from "@/components/pdv/checklists/SchedulesManager";
import { OperatorsManager } from "@/components/pdv/checklists/OperatorsManager";
import { DailyTasksView } from "@/components/pdv/tasks/DailyTasksView";
import { TaskSettings } from "@/components/pdv/tasks/TaskSettings";
import { TaskQRCodeDialog } from "@/components/pdv/tasks/TaskQRCodeDialog";
import { useOperationalTasks } from "@/hooks/use-operational-tasks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function Tasks() {
  const [qrOpen, setQrOpen] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const { user } = useAuth();
  const {
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
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo esgotado (20s). Tente novamente.")), 20000)
      );
      const result = await Promise.race([
        supabase.functions.invoke("send-tasks-report", { body: { user_id: user.id } }),
        timeoutPromise,
      ]) as { data: any; error: any };
      if (result.error) throw result.error;
      if (result.data?.error) throw new Error(result.data.error);
      toast({ title: "Relatório enviado! ✅", description: "O resumo das tarefas foi enviado via WhatsApp." });
    } catch (err: any) {
      toast({ title: "Erro ao enviar relatório", description: err.message || "Erro desconhecido", variant: "destructive" });
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Checklists Operacionais"
        description="Gestão completa de checklists, equipe e agendamentos"
      >
        <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
          <QrCode className="h-4 w-4 mr-2" /> QR Code
        </Button>
        <Button variant="outline" size="sm" onClick={handleSendReport} disabled={sendingReport}>
          <Send className={`h-4 w-4 mr-2 ${sendingReport ? "animate-pulse" : ""}`} />
          Relatório
        </Button>
        <Button variant="outline" size="sm" onClick={() => generateDailyFn(undefined)} disabled={isGenerating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          Gerar Tarefas
        </Button>
      </ResponsivePageHeader>

      <Tabs defaultValue="checklists">
        <TabsList className="flex-wrap">
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="agendamento">Agendamento</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="hoje">Tarefas do Dia</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="mt-4">
          <ChecklistsManager />
        </TabsContent>
        <TabsContent value="agendamento" className="mt-4">
          <SchedulesManager />
        </TabsContent>
        <TabsContent value="equipe" className="mt-4">
          <OperatorsManager />
        </TabsContent>
        <TabsContent value="hoje" className="mt-4">
          <DailyTasksView instances={instances} shifts={settings.shifts} isLoading={loadingInstances} />
        </TabsContent>
        <TabsContent value="configuracoes" className="mt-4">
          <TaskSettings />
        </TabsContent>
      </Tabs>

      <TaskQRCodeDialog open={qrOpen} onOpenChange={setQrOpen} />
    </div>
  );
}
