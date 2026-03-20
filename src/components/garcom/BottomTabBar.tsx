import { NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, ClipboardList, ChefHat, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabsBefore = [
  { to: "/garcom", icon: LayoutGrid, label: "Mesas", end: true },
  { to: "/garcom/comandas", icon: ClipboardList, label: "Comandas" },
];

const tabsAfter = [
  { to: "/garcom/cozinha", icon: ChefHat, label: "Cozinha" },
];

export function BottomTabBar({ onNewComanda }: { onNewComanda?: () => void }) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background safe-area-bottom">
      <div className="grid grid-cols-4 h-16">
        {tabsBefore.map((tab) => {
          const isActive = tab.end
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={onNewComanda}
          className="flex flex-col items-center justify-center gap-0.5 text-xs text-primary font-semibold active:scale-95 transition-transform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md -mt-4">
            <Plus className="h-5 w-5" />
          </div>
          Novo
        </button>
        {tabsAfter.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
