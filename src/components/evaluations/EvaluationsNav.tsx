import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Megaphone, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/avaliacoes", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/avaliacoes/campanhas", label: "Campanhas", icon: Megaphone },
  { to: "/avaliacoes/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/avaliacoes/configuracoes", label: "Configurações", icon: Settings },
];

export function EvaluationsNav() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            isActive(item.to, item.exact)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="hidden md:inline">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
