import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  Users,
  ListChecks,
  Settings,
  Trophy,
  Camera,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Painel", url: "/pdv/tarefas", icon: LayoutDashboard, end: true },
  { title: "Checklists", url: "/pdv/tarefas/checklists", icon: ClipboardCheck },
  { title: "Agendamento", url: "/pdv/tarefas/agendamento", icon: Calendar },
  { title: "Equipe", url: "/pdv/tarefas/equipe", icon: Users },
  { title: "Tarefas do Dia", url: "/pdv/tarefas/hoje", icon: ListChecks },
  { title: "Configurações", url: "/pdv/tarefas/configuracoes", icon: Settings },
];

const navItemsSecondary = [
  { title: "Score", url: "/pdv/tarefas/score", icon: Trophy },
  { title: "Evidências", url: "/pdv/tarefas/evidencias", icon: Camera },
  { title: "Validade", url: "/pdv/tarefas/validade", icon: ShieldAlert },
  { title: "Logs", url: "/pdv/tarefas/logs", icon: FileText },
];

export function ChecklistsSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string, end?: boolean) =>
    end ? location.pathname === url : location.pathname.startsWith(url);

  const renderItems = (items: typeof navItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url, item.end)}>
          <NavLink to={item.url} end={item.end}>
            <item.icon className="h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r [&>div:first-child]:h-[calc(100svh-3.5rem)] [&>div:nth-child(2)]:top-14 [&>div:nth-child(2)]:h-[calc(100svh-3.5rem)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Análises</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(navItemsSecondary)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
