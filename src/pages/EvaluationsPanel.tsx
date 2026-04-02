import { ModuleGuard } from "@/components/ModuleGuard";
import { Logo } from "@/components/ui/logo";
import { PDVUserMenu } from "@/components/pdv/PDVUserMenu";
import Evaluations from "@/pages/pdv/Evaluations";

export default function EvaluationsPanel() {
  return (
    <ModuleGuard module="avaliacoes">
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-lg font-semibold text-foreground">Avaliações</span>
            </div>
            <PDVUserMenu />
          </div>
        </header>
        <main>
          <Evaluations />
        </main>
      </div>
    </ModuleGuard>
  );
}
