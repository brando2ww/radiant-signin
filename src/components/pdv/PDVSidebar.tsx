import { NavLink, useLocation } from "react-router-dom";
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
  ChevronDown,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.5rem" },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};

interface SectionItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface Section {
  title: string;
  icon: LucideIcon;
  items: SectionItem[];
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
    ]
  },
  {
    title: "Frente de Caixa",
    icon: Store,
    items: [
      { title: "Salão", url: "/pdv/salao", icon: Armchair },
      { title: "Balcão", url: "/pdv/balcao", icon: ShoppingBag },
      { title: "Caixa", url: "/pdv/caixa", icon: DollarSign },
      { title: "Cozinha", url: "/pdv/cozinha", icon: ChefHat },
    ]
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
    ]
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
    ]
  }
];

function getActiveSectionTitle(pathname: string): string | null {
  for (const section of sectionItems) {
    if (section.items.some(item => pathname === item.url || pathname.startsWith(item.url + "/"))) {
      return section.title;
    }
  }
  return null;
}

export function PDVSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;
  
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const activeSection = getActiveSectionTitle(pathname);
    return activeSection ? [activeSection] : [];
  });

  useEffect(() => {
    const activeSection = getActiveSectionTitle(pathname);
    if (activeSection && !openSections.includes(activeSection)) {
      setOpenSections(prev => [...prev, activeSection]);
    }
  }, [pathname]);

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleSectionClick = (sectionTitle: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      if (!openSections.includes(sectionTitle)) {
        setOpenSections(prev => [...prev, sectionTitle]);
      }
    } else {
      toggleSection(sectionTitle);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        className={cn("sidebar fixed left-0 z-50 h-full shrink-0 border-r bg-background")}
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col transition-all">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-16 w-full shrink-0 border-b p-3 items-center">
              <div className="flex items-center gap-2 px-1">
                {isCollapsed ? (
                  <div className="flex items-center justify-center w-8 h-8">
                    <Logo size="sm" className="h-6 w-auto object-contain" />
                  </div>
                ) : (
                  <Logo size="lg" className="h-12 w-auto" />
                )}
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 p-2">
              <div className="flex flex-col gap-1">
                {sectionItems.map((section) => {
                  const isSectionOpen = openSections.includes(section.title);
                  const isSectionActive = section.items.some(
                    item => pathname === item.url || pathname.startsWith(item.url + "/")
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={section.title}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSectionClick(section.title)}
                            className={cn(
                              "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              isSectionActive && "bg-accent text-accent-foreground"
                            )}
                          >
                            <section.icon className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          {section.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Collapsible
                      key={section.title}
                      open={isSectionOpen}
                      onOpenChange={() => toggleSection(section.title)}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          "flex h-10 w-full items-center justify-between rounded-md px-3 transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isSectionActive && "text-foreground font-medium"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <section.icon className="h-4 w-4" />
                          <span className="text-sm">{section.title}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isSectionOpen && "rotate-180"
                          )}
                        />
                      </CollapsibleTrigger>

                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="flex flex-col gap-0.5 pt-1 pb-2">
                          {section.items.map((item) => (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              className={cn(
                                "flex h-9 items-center gap-3 rounded-md pl-10 pr-3 text-sm transition-colors",
                                "hover:bg-accent hover:text-accent-foreground",
                                pathname === item.url && "bg-accent text-accent-foreground font-medium"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </NavLink>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
