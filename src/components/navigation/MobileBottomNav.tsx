import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTransactionDialog } from "@/contexts/TransactionDialogContext";
import { 
  Home, 
  Building2, 
  Calendar,
  Settings,
  Plus,
  LayoutDashboard,
  TrendingUp,
  Target,
  BarChart3,
  CreditCard,
  Wallet,
  CheckSquare,
  Crown,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "contas", label: "Contas", icon: Building2 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "config", label: "Config", icon: Settings },
];

const navigationSections = {
  inicio: [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Receitas/Despesas", icon: TrendingUp },
    { path: "/goals", label: "Metas", icon: Target },
    { path: "/reports", label: "Relatórios", icon: BarChart3 },
  ],
  contas: [
    { path: "/credit-cards", label: "Cartões de Crédito", icon: CreditCard },
    { path: "/bank-accounts", label: "Contas Bancárias", icon: Wallet },
    { path: "/whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
  ],
  agenda: [
    { path: "/calendar", label: "Calendário", icon: Calendar },
    { path: "/tasks", label: "Tarefas", icon: CheckSquare },
  ],
  config: [
    { path: "/settings", label: "Configurações", icon: Settings },
    { path: "/plans", label: "Planos", icon: Crown },
  ],
};

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openDialog } = useTransactionDialog();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const currentPath = location.pathname;

  // Determina qual seção contém a rota ativa
  const getActiveSection = () => {
    for (const [sectionId, items] of Object.entries(navigationSections)) {
      if (items.some(item => currentPath === item.path || currentPath.startsWith(item.path + "/"))) {
        return sectionId;
      }
    }
    return "inicio";
  };

  const activeSection = getActiveSection();

  return (
    <div className="lg:hidden">
      {/* Expanded Menu Overlay */}
      {expandedSection && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setExpandedSection(null)}
          />
          
          {/* Menu expandido */}
          <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
            <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
              <div className="p-4 pb-28">
                <h3 className="text-sm font-semibold text-foreground mb-3 px-2">
                  {mainNavItems.find(item => item.id === expandedSection)?.label}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {navigationSections[expandedSection as keyof typeof navigationSections]?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isActive = currentPath === subItem.path || currentPath.startsWith(subItem.path + "/");
                    
                    return (
                      <button
                        key={subItem.path}
                        onClick={() => {
                          navigate(subItem.path);
                          setExpandedSection(null);
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "bg-muted/50 hover:bg-muted hover:scale-105"
                        )}
                      >
                        <SubIcon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-left">
                          {subItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative max-w-md mx-auto">
          <div className="relative bg-background/95 backdrop-blur-lg border-t border-border rounded-t-3xl">
            <div className="flex justify-around items-center h-24 px-4 pb-8">
              {/* First 2 items */}
              {mainNavItems.slice(0, 2).map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (expandedSection === item.id) {
                        setExpandedSection(null);
                      } else {
                        setExpandedSection(item.id);
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 group py-2 px-1 min-w-[60px] relative",
                      expandedSection === item.id && "scale-105"
                    )}
                  >
                    {/* Indicador de expandido */}
                    {expandedSection === item.id && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                    
                    <Icon
                      strokeWidth={1.0}
                      className={cn(
                        "transition-all duration-300 ease-out",
                        isActive || expandedSection === item.id
                          ? "w-7 h-7 scale-110 text-foreground"
                          : "w-6 h-6 text-muted-foreground group-hover:scale-105 group-hover:text-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] transition-all duration-300 text-center leading-tight",
                      isActive || expandedSection === item.id
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Central FAB (elevated) */}
              <button
                onClick={() => openDialog()}
                className="flex flex-col items-center justify-center gap-1 group"
              >
                <div className="relative z-20 -mt-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <Plus strokeWidth={1.5} className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-all duration-300 text-center leading-tight mt-1">
                  Novo
                </span>
              </button>

              {/* Last 2 items */}
              {mainNavItems.slice(2).map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (expandedSection === item.id) {
                        setExpandedSection(null);
                      } else {
                        setExpandedSection(item.id);
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 group py-2 px-1 min-w-[60px] relative",
                      expandedSection === item.id && "scale-105"
                    )}
                  >
                    {/* Indicador de expandido */}
                    {expandedSection === item.id && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                    
                    <Icon
                      strokeWidth={1.0}
                      className={cn(
                        "transition-all duration-300 ease-out",
                        isActive || expandedSection === item.id
                          ? "w-7 h-7 scale-110 text-foreground"
                          : "w-6 h-6 text-muted-foreground group-hover:scale-105 group-hover:text-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] transition-all duration-300 text-center leading-tight",
                      isActive || expandedSection === item.id
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-24" />
    </div>
  );
}
