import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Moon, Sun } from "lucide-react";
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

export function GarcomHeader({ title }: { title?: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [showLogout, setShowLogout] = useState(false);
  const displayName =
    user?.user_metadata?.name?.split(" ")[0] || "Garçom";

  const isDark = resolvedTheme === "dark";

  const handleCallManager = () => {
    // feedback de toast removido a pedido — botão segue funcional
  };

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 safe-area-top">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">Olá, {displayName}</p>
          {title && <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95 transition-transform"
            aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleCallManager}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive active:scale-95 transition-transform"
            aria-label="Chamar Gerente"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground active:scale-95 transition-transform"
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do aplicativo</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente sair do app?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
