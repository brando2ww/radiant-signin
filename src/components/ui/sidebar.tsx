import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  UserCircle,
  UserCog,
  BarChart3,
  Package,
  Calendar,
  CheckSquare,
  Target,
  TrendingUp,
  CreditCard,
  Wallet,
  Users,
  Star,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { EditProfileDialog } from "@/components/ui/edit-profile-dialog";
import { useUserModules } from "@/hooks/use-user-modules";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
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

export function SessionNavBar() {
  const { settings } = useSettings();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { hasModule } = useUserModules();
  
  const pathname = location.pathname;

  // Sync sidebar state with user settings
  useEffect(() => {
    if (settings?.general?.sidebar_expanded !== undefined) {
      setIsCollapsed(!settings.general.sidebar_expanded);
    }
  }, [settings?.general?.sidebar_expanded]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r hidden lg:block",
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
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2"
                    >
                      <Avatar className="rounded size-4">
                        {profile?.avatar_url && (
                          <AvatarImage src={profile.avatar_url} alt="Avatar" />
                        )}
                        <AvatarFallback>
                          {profile?.full_name?.[0]?.toUpperCase() || 
                           user?.email?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              Organização
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" /> Gerenciar membros
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Blocks className="h-4 w-4" /> Integrações
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Criar organização
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <Link
                      to="/dashboard"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("dashboard") && "bg-muted text-primary",
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/transactions"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("transactions") && "bg-muted text-primary",
                      )}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Receitas e Despesas</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/credit-cards"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("credit-cards") && "bg-muted text-primary",
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Cartões de Crédito</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/bank-accounts"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("bank-accounts") && "bg-muted text-primary",
                      )}
                    >
                      <Wallet className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Contas Bancárias</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/whatsapp"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("whatsapp") && "bg-muted text-primary",
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">WhatsApp</p>
                        )}
                      </motion.li>
                    </Link>

                    <Separator className="my-2" />

                    <Link
                      to="/calendar"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("calendar") && "bg-muted text-primary",
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Agenda</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/tasks"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("tasks") && "bg-muted text-primary",
                      )}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Tarefas</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/goals"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("goals") && "bg-muted text-primary",
                      )}
                    >
                      <Target className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Metas</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/crm"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("crm") && "bg-muted text-primary",
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">CRM</p>
                        )}
                      </motion.li>
                    </Link>

                    <Link
                      to="/avaliacoes"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("avaliacoes") && "bg-muted text-primary",
                      )}
                    >
                      <Star className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Avaliações</p>
                        )}
                      </motion.li>
                    </Link>


                    {hasModule('pdv') && (
                      <Link
                        to="/pdv/dashboard"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname.includes("/pdv") && "bg-muted text-primary",
                        )}
                      >
                        <DollarSign className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">PDV</p>
                          )}
                        </motion.li>
                      </Link>
                    )}

                    <Separator className="my-2" />

                    <Link
                      to="/reports"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname.includes("reports") && "bg-muted text-primary",
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Relatórios</p>
                        )}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <Link
                  to="/settings"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium">Configurações</p>
                    )}
                  </motion.li>
                </Link>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          {profile?.avatar_url && (
                            <AvatarImage src={profile.avatar_url} alt="Avatar" />
                          )}
                          <AvatarFallback>
                            {profile?.full_name?.[0]?.toUpperCase() || 
                             user?.email?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Conta</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          {profile?.avatar_url && (
                            <AvatarImage src={profile.avatar_url} alt="Avatar" />
                          )}
                          <AvatarFallback>
                            {profile?.full_name?.[0]?.toUpperCase() || 
                             user?.email?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {profile?.full_name || user?.email}
                          </span>
                          {profile?.full_name && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                              {user?.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={() => setIsEditProfileOpen(true)}
                      >
                        <UserCircle className="h-4 w-4" /> Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2" asChild>
                        <Link to="/plans">
                          <Package className="h-4 w-4" /> Planos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
      <EditProfileDialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} />
    </motion.div>
  );
}
