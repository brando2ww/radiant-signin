import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, Send, PanelLeft } from "lucide-react";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChecklistsSidebar } from "@/components/pdv/checklists/ChecklistsSidebar";
import { ChecklistsManager } from "@/components/pdv/checklists/ChecklistsManager";
import { SchedulesManager } from "@/components/pdv/checklists/SchedulesManager";
import { OperatorsManager } from "@/components/pdv/checklists/OperatorsManager";
import { DailyTasksView } from "@/components/pdv/tasks/DailyTasksView";
import { TaskSettings } from "@/components/pdv/tasks/TaskSettings";
import { TaskQRCodeDialog } from "@/components/pdv/tasks/TaskQRCodeDialog";
import { DashboardPanel } from "@/components/pdv/checklists/DashboardPanel";
import { TeamScorePanel } from "@/components/pdv/checklists/TeamScorePanel";
import { EvidenceGallery } from "@/components/pdv/checklists/EvidenceGallery";
import { ExpiryTrackingPanel } from "@/components/pdv/checklists/ExpiryTrackingPanel";
import { AccessLogsPanel } from "@/components/pdv/checklists/AccessLogsPanel";
import { useOperationalTasks } from "@/hooks/use-operational-tasks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

function DailyTasksWrapper() {
  const { instances, settings, loadingInstances } = useOperationalTasks();
  return <DailyTasksView instances={instances} shifts={settings.shifts} isLoading={loadingInstances} />;
}

export default function Tasks() {
  const [qrOpen, setQrOpen] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const { user } = useAuth();
  const { generateDaily: generateDailyFn, isGenerating } = useOperationalTasks();

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
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
        <ChecklistsSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            <ResponsivePageHeader
              title="Checklists Operacionais"
              description="Gestão completa de checklists, equipe e agendamentos"
            >
              <div className="flex items-center gap-2">
                <SidebarTrigger>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </SidebarTrigger>
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
              </div>
            </ResponsivePageHeader>

            <Routes>
              <Route index element={<DashboardPanel />} />
              <Route path="checklists" element={<ChecklistsManager />} />
              <Route path="agendamento" element={<SchedulesManager />} />
              <Route path="equipe" element={<OperatorsManager />} />
              <Route path="hoje" element={<DailyTasksWrapper />} />
              <Route path="configuracoes" element={<TaskSettings />} />
              <Route path="score" element={<TeamScorePanel />} />
              <Route path="evidencias" element={<EvidenceGallery />} />
              <Route path="validade" element={<ExpiryTrackingPanel />} />
              <Route path="logs" element={<AccessLogsPanel />} />
              <Route path="*" element={<Navigate to="/pdv/tarefas" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      <TaskQRCodeDialog open={qrOpen} onOpenChange={setQrOpen} />
    </SidebarProvider>
  );
}
