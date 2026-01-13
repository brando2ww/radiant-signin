import { NavLink, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Armchair,
  ShoppingBag,
  ChefHat,
  Package,
  Warehouse,
  Truck,
  BarChart3,
  Settings,
  FileText,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  FolderTree,
  Target,
  FileBarChart,
  PackageSearch,
  PieChart,
  Receipt,
  DollarSign,
  UtensilsCrossed,
  Tag,
  Palette,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface Section {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

const sectionItems: Section[] = [
  {
    title: "Financeiro",
    icon: DollarSign,
    items: [
      { title: "Lançamentos", url: "/pdv/financeiro/lancamentos", icon: FileText },
      { title: "Contas a Pagar", url: "/pdv/financeiro/contas-pagar", icon: TrendingDown },
      { title: "Contas a Receber", url: "/pdv/financeiro/contas-receber", icon: TrendingUp },
      { title: "Fluxo de Caixa", url: "/pdv/financeiro/fluxo-caixa", icon: ArrowLeftRight },
      { title: "Plano de Contas", url: "/pdv/financeiro/plano-contas", icon: FolderTree },
      { title: "Centros de Custo", url: "/pdv/financeiro/centros-custo", icon: Target },
      { title: "DRE", url: "/pdv/financeiro/dre", icon: FileBarChart },
      { title: "CMV Produtos", url: "/pdv/financeiro/cmv-produtos", icon: PackageSearch },
      { title: "CMV Geral", url: "/pdv/financeiro/cmv-geral", icon: PieChart },
    ],
  },
  {
    title: "Frente de Caixa",
    icon: Store,
    items: [
      { title: "Salão", url: "/pdv/salao", icon: Armchair },
      { title: "Balcão", url: "/pdv/balcao", icon: ShoppingBag },
      { title: "Caixa", url: "/pdv/caixa", icon: DollarSign },
      { title: "Cozinha", url: "/pdv/cozinha", icon: ChefHat },
    ],
  },
  {
    title: "Delivery",
    icon: Truck,
    items: [
      { title: "Pedidos", url: "/pdv/delivery/pedidos", icon: ShoppingBag },
      { title: "Cardápio", url: "/pdv/delivery/cardapio", icon: UtensilsCrossed },
      { title: "Personalização", url: "/pdv/delivery/personalizacao", icon: Palette },
      { title: "Cupons", url: "/pdv/delivery/cupons", icon: Tag },
      { title: "Configurações", url: "/pdv/delivery/configuracoes", icon: Settings },
      { title: "Relatórios", url: "/pdv/delivery/relatorios", icon: BarChart3 },
    ],
  },
  {
    title: "Administrador",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", url: "/pdv/dashboard", icon: LayoutDashboard },
      { title: "Produtos", url: "/pdv/produtos", icon: Package },
      { title: "Estoque", url: "/pdv/estoque", icon: Warehouse },
      { title: "Fornecedores", url: "/pdv/fornecedores", icon: Truck },
      { title: "Notas Fiscais", url: "/pdv/notas-fiscais", icon: Receipt },
      { title: "Relatórios", url: "/pdv/relatorios", icon: BarChart3 },
      { title: "Configurações", url: "/pdv/configuracoes", icon: Settings },
    ],
  },
];

export function PDVHeaderNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {sectionItems.map((section) => {
          const isSectionActive = section.items.some(
            (item) => pathname === item.url || pathname.startsWith(item.url + "/")
          );
          const SectionIcon = section.icon;

          return (
            <NavigationMenuItem key={section.title}>
              <NavigationMenuTrigger
                className={cn(
                  "gap-2",
                  isSectionActive && "bg-accent text-accent-foreground"
                )}
              >
                <SectionIcon className="h-4 w-4" />
                <span className="hidden lg:inline">{section.title}</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[280px] gap-1 p-2 md:w-[400px] md:grid-cols-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.url;

                    return (
                      <li key={item.url}>
                        <NavigationMenuLink asChild>
                          <NavLink
                            to={item.url}
                            className={cn(
                              "flex items-center gap-3 select-none rounded-md p-3",
                              "text-sm leading-none no-underline outline-none transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus:bg-accent focus:text-accent-foreground",
                              isActive && "bg-accent text-accent-foreground font-medium"
                            )}
                          >
                            <ItemIcon className="h-4 w-4 shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        </NavigationMenuLink>
                      </li>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
