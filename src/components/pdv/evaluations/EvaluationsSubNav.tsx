import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Megaphone, BarChart3, Users, Gift, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  children?: { to: string; label: string }[];
}

const navItems: NavItem[] = [
  { to: "", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "campanhas", label: "Campanhas", icon: Megaphone },
  {
    to: "relatorios", label: "Relatórios", icon: BarChart3,
    children: [
      { to: "relatorios/diario", label: "Diário" },
      { to: "relatorios/semanal", label: "Semanal" },
      { to: "relatorios/mensal", label: "Mensal" },
    ],
  },
  {
    to: "clientes", label: "Clientes", icon: Users,
    children: [
      { to: "clientes/painel", label: "Painel" },
      { to: "clientes/gestao", label: "Gestão" },
      { to: "clientes/aniversariantes", label: "Aniversariantes" },
    ],
  },
  {
    to: "cupons", label: "Cupons", icon: Gift,
    children: [
      { to: "cupons/painel", label: "Painel" },
      { to: "cupons/gestao", label: "Gestão" },
      { to: "cupons/validacao", label: "Validação" },
      { to: "cupons/sorteio", label: "Sorteio" },
      { to: "cupons/roletas", label: "Roletas" },
    ],
  },
  { to: "configuracoes", label: "Configurações", icon: Settings },
];

export function EvaluationsSubNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = "/pdv/avaliacoes";

  const isActive = (to: string, exact?: boolean) => {
    const fullPath = to ? `${basePath}/${to}` : basePath;
    if (exact) return location.pathname === fullPath;
    return location.pathname.startsWith(fullPath) && to !== "";
  };

  const renderSimpleItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.to, item.exact);
    return (
      <button
        key={item.to}
        onClick={() => navigate(item.to || ".")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{item.label}</span>
      </button>
    );
  };

  const renderDropdownItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    return (
      <DropdownMenu key={item.to}>
        <div className="flex items-center">
          <button
            onClick={() => navigate(item.children![0].to)}
            className={cn(
              "flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-l-md text-sm font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center px-1 py-1.5 rounded-r-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="start" className="min-w-[160px]">
          {item.children!.map((child) => {
            const childActive = location.pathname === `${basePath}/${child.to}`;
            return (
              <DropdownMenuItem
                key={child.to}
                onClick={() => navigate(child.to)}
                className={cn(childActive && "bg-accent font-medium")}
              >
                {child.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-11 items-center px-4 gap-1 overflow-x-auto">
        {navItems.map((item) =>
          item.children ? renderDropdownItem(item) : renderSimpleItem(item)
        )}
      </div>
    </div>
  );
}
