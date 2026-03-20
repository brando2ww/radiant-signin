import { LayoutDashboard, Building2, CreditCard, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Tenants", url: "/admin/tenants", icon: Building2 },
  { title: "Planos", url: "/admin/planos", icon: CreditCard },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="!bg-white !border-gray-200 [&_*]:!text-gray-700">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
            V
          </div>
          {!collapsed && (
            <span className="font-semibold text-base tracking-tight !text-gray-900">Velaro Admin</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="!bg-gray-200" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="!text-gray-500">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.end
                        ? location.pathname === item.url
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:!bg-gray-100"
                      activeClassName="!bg-blue-50 !text-blue-700"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="!bg-gray-200" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 !text-gray-500 hover:!text-gray-900 hover:!bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
