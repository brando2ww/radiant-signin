import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Megaphone, BarChart3, Users, Gift, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "campanhas", label: "Campanhas", icon: Megaphone },
  { to: "relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "clientes", label: "Clientes", icon: Users },
  { to: "cupons", label: "Cupons", icon: Gift },
  { to: "configuracoes", label: "Configurações", icon: Settings },
];

export function EvaluationsSubNav() {
  const location = useLocation();
  const basePath = "/pdv/avaliacoes";

  const isActive = (to: string, exact?: boolean) => {
    const fullPath = to ? `${basePath}/${to}` : basePath;
    if (exact) return location.pathname === fullPath;
    return location.pathname.startsWith(fullPath) && to !== "";
  };

  return (
    <div className="sticky top-14 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-11 items-center px-4 gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
