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
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.5rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.2,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const sectionItems = [
  {
    title: "Financeiro",
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
    items: [
      { title: "Salão", url: "/pdv/salao", icon: Armchair },
      { title: "Balcão", url: "/pdv/balcao", icon: ShoppingBag },
      { title: "Caixa", url: "/pdv/caixa", icon: DollarSign },
      { title: "Cozinha", url: "/pdv/cozinha", icon: ChefHat },
    ]
  },
  {
    title: "Delivery",
    items: [
      { title: "Pedidos", url: "/pdv/delivery/pedidos", icon: ShoppingBag },
      { title: "Cardápio", url: "/pdv/delivery/cardapio", icon: UtensilsCrossed },
      { title: "Cupons", url: "/pdv/delivery/cupons", icon: Tag },
      { title: "Configurações", url: "/pdv/delivery/configuracoes", icon: Settings },
      { title: "Relatórios", url: "/pdv/delivery/relatorios", icon: BarChart3 },
    ]
  },
  {
    title: "Administrador",
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

export function PDVSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-50 h-full shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-background transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
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
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col")}>
                    {sectionItems.map((section, sectionIndex) => (
                      section.items.length > 0 && (
                        <div key={section.title} className={sectionIndex > 0 ? "mt-4" : ""}>
                          {!isCollapsed && (
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {section.title}
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            {section.items.map((item) => (
                              <NavLink
                                key={item.url}
                                to={item.url}
                                className={cn(
                                  "flex h-9 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-accent hover:text-accent-foreground",
                                  pathname === item.url && "bg-accent text-accent-foreground font-medium"
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                <motion.li variants={variants}>
                                  {!isCollapsed && (
                                    <p className="ml-2 text-sm font-medium">{item.title}</p>
                                  )}
                                </motion.li>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
