import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
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
  Megaphone,
  Plug,
  Users,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
}

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Bem-vindo ao Velara PDV!",
    message: "Configure suas mesas e produtos para começar.",
    date: "13/01/2026",
  },
];

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
      { title: "Cotações", url: "/pdv/compras/cotacoes", icon: FileText },
      { title: "Pedidos de Compra", url: "/pdv/compras/pedidos", icon: ShoppingBag },
      { title: "Lista de Compras", url: "/pdv/compras/lista", icon: PackageSearch },
      { title: "Notas Fiscais", url: "/pdv/notas-fiscais", icon: Receipt },
      { title: "Relatórios", url: "/pdv/relatorios", icon: BarChart3 },
      { title: "Configurações", url: "/pdv/configuracoes", icon: Settings },
      { title: "Usuários", url: "/pdv/usuarios", icon: Users },
    ],
  },
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
    title: "Integrações",
    icon: Plug,
    items: [
      { title: "Gerenciar Integrações", url: "/pdv/integracoes", icon: Plug },
    ],
  },
];

export function PDVHeaderNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const { canAccess } = useUserRole();

  const filteredSections = useMemo(() => {
    return sectionItems
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canAccess(item.url)),
      }))
      .filter((section) => section.items.length > 0);
  }, [canAccess]);

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedAnnouncements.includes(a.id)
  );

  const renderNavLinks = (items: NavItem[]) => (
    <ul className="grid gap-1 p-2 md:grid-cols-2">
      {items.map((item) => {
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
  );

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {filteredSections.map((section) => {
          const isSectionActive = section.items.some(
            (item) => pathname === item.url || pathname.startsWith(item.url + "/")
          );
          const SectionIcon = section.icon;
          const isAdminSection = section.title === "Administrador";

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
                {isAdminSection && visibleAnnouncements.length > 0 ? (
                  <div className="flex w-[280px] md:w-[550px]">
                    {/* Coluna Esquerda - Comunicados */}
                    <div className="w-[180px] border-r border-border p-3 bg-primary/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Comunicados</span>
                      </div>
                      <div className="space-y-2">
                        {visibleAnnouncements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className="rounded-md bg-background p-2 text-xs"
                          >
                            <p className="font-medium text-foreground">{announcement.title}</p>
                            <p className="text-muted-foreground mt-1">
                              {announcement.message}
                            </p>
                            <span className="text-muted-foreground/70 text-[10px]">
                              {announcement.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Coluna Direita - Links */}
                    <div className="flex-1">
                      {renderNavLinks(section.items)}
                    </div>
                  </div>
                ) : (
                  <div className="w-[280px] md:w-[400px]">
                    {renderNavLinks(section.items)}
                  </div>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
