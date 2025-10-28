import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Armchair, 
  ShoppingBag, 
  DollarSign, 
  ChefHat, 
  Package, 
  Warehouse,
  Truck,
  BarChart3,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
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
    title: "Fornecedores", 
    url: "/pdv/fornecedores", 
    icon: Truck 
  },
  { 
    title: "Relatórios", 
    url: "/pdv/relatorios", 
    icon: BarChart3 
  },
  { 
    title: "Configurações", 
    url: "/pdv/configuracoes", 
    icon: Settings 
  },
];

export function PDVSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r"
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
            <div className="flex h-14 w-full shrink-0 border-b p-2 items-center">
              <div className="flex items-center gap-2 px-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                  <DollarSign className="h-5 w-5" />
                </div>
                <motion.div variants={variants}>
                  {!isCollapsed && (
                    <span className="font-semibold text-lg text-foreground">
                      Velara PDV
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {navItems.map((item) => (
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
                </ScrollArea>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
