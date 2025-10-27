import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Armchair, 
  ShoppingBag, 
  DollarSign, 
  ChefHat, 
  Package, 
  Warehouse, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDVUserMenu } from "./PDVUserMenu";
import { PDVNotifications } from "./PDVNotifications";
import { CashierStatus } from "./CashierStatus";

const navItems = [
  { 
    title: "Dashboard", 
    url: "/pdv/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    title: "Salão", 
    url: "/pdv/salao", 
    icon: Armchair 
  },
  { 
    title: "Balcão", 
    url: "/pdv/balcao", 
    icon: ShoppingBag 
  },
  { 
    title: "Caixa", 
    url: "/pdv/caixa", 
    icon: DollarSign 
  },
  { 
    title: "Cozinha", 
    url: "/pdv/cozinha", 
    icon: ChefHat 
  },
  { 
    title: "Produtos", 
    url: "/pdv/produtos", 
    icon: Package 
  },
  { 
    title: "Estoque", 
    url: "/pdv/estoque", 
    icon: Warehouse 
  },
  { 
    title: "Relatórios", 
    url: "/pdv/relatorios", 
    icon: BarChart3 
  },
];

export function PDVNavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">Velara PDV</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <CashierStatus />
          <PDVNotifications />
          <PDVUserMenu />
        </div>
      </div>
    </header>
  );
}
