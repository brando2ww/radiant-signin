import { cn } from "@/lib/utils";
import { Clock, Building2, Bell, FileBarChart, Play, Shield, Database } from "lucide-react";

const SECTIONS = [
  { id: "turnos", label: "Turnos", icon: Clock },
  { id: "setores", label: "Setores", icon: Building2 },
  { id: "alertas", label: "Alertas", icon: Bell },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
  { id: "execucao", label: "Execução", icon: Play },
  { id: "acesso", label: "Acesso", icon: Shield },
  { id: "dados", label: "Dados", icon: Database },
];

export function SettingsNavAnchors() {
  const scrollTo = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium whitespace-nowrap",
              "hover:bg-muted transition-colors shrink-0"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
