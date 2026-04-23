import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, MoreHorizontal, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ActionItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  iconClassName?: string;
  bgClassName?: string;
}

export function GarcomActionFab() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const isDark = resolvedTheme === "dark";

  const close = () => setOpen(false);

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
    close();
  };

  const handleCallManager = () => {
    // Botão segue funcional — sem toast, conforme histórico do projeto.
    close();
  };

  const handleSignOutRequest = () => {
    close();
    setShowLogout(true);
  };

  const handleSignOutConfirm = async () => {
    await signOut();
    navigate("/");
  };

  const actions: ActionItem[] = [
    {
      key: "logout",
      label: "Sair",
      icon: LogOut,
      onClick: handleSignOutRequest,
    },
    {
      key: "manager",
      label: "Chamar Gerente",
      icon: Bell,
      onClick: handleCallManager,
      iconClassName: "text-destructive",
      bgClassName: "bg-destructive/10",
    },
    {
      key: "theme",
      label: isDark ? "Tema claro" : "Tema escuro",
      icon: isDark ? Sun : Moon,
      onClick: handleToggleTheme,
    },
  ];

  return (
    <>
      {/* Backdrop transparente para fechar ao tocar fora */}
      {open && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-30 cursor-default bg-transparent"
        />
      )}

      <div
        className={cn(
          "fixed right-4 z-50 flex flex-col items-end gap-3 pointer-events-none",
        )}
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        {/* Mini FABs */}
        <div
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-200",
            open
              ? "pointer-events-auto opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-2 invisible h-0 overflow-hidden",
          )}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.key}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  open ? "translate-y-0" : "translate-y-2",
                )}
                style={{
                  transitionDelay: open
                    ? `${index * 30}ms`
                    : `${(actions.length - index - 1) * 20}ms`,
                }}
              >
                <span className="rounded-md bg-card px-2 py-1 text-xs font-medium text-foreground shadow-md border">
                  {action.label}
                </span>
                <button
                  type="button"
                  onClick={action.onClick}
                  aria-label={action.label}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full shadow-md active:scale-95 transition-transform",
                    action.bgClassName ?? "bg-card border",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      action.iconClassName ?? "text-foreground",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* FAB principal */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar ações" : "Abrir ações"}
          aria-expanded={open}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <MoreHorizontal className="h-5 w-5" />
          )}
        </button>
      </div>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent className="max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do aplicativo</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente sair do app?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOutConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
