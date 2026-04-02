import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleGuard } from "@/components/ModuleGuard";
import { Logo } from "@/components/ui/logo";
import { PDVUserMenu } from "@/components/pdv/PDVUserMenu";
import { EvaluationsNav } from "@/components/evaluations/EvaluationsNav";
import EvaluationsDashboard from "@/pages/evaluations/EvaluationsDashboard";
import EvaluationsCampaigns from "@/pages/evaluations/EvaluationsCampaigns";
import EvaluationsReports from "@/pages/evaluations/EvaluationsReports";
import EvaluationsSettings from "@/pages/evaluations/EvaluationsSettings";

export default function EvaluationsPanel() {
  return (
    <ModuleGuard module="avaliacoes">
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <EvaluationsNav />
            </div>
            <PDVUserMenu />
          </div>
        </header>
        <main>
          <Routes>
            <Route index element={<EvaluationsDashboard />} />
            <Route path="campanhas" element={<EvaluationsCampaigns />} />
            <Route path="relatorios" element={<EvaluationsReports />} />
            <Route path="configuracoes" element={<EvaluationsSettings />} />
            <Route path="*" element={<Navigate to="/avaliacoes" replace />} />
          </Routes>
        </main>
      </div>
    </ModuleGuard>
  );
}
