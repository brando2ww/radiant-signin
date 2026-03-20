import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function GarcomHeader({ title }: { title?: string }) {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.name?.split(" ")[0] || "Garçom";

  const handleCallManager = () => {
    toast.info("Chamado enviado ao gerente!", { duration: 3000 });
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 safe-area-top">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">Olá, {displayName}</p>
        {title && <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>}
      </div>
      <button
        type="button"
        onClick={handleCallManager}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive active:scale-95 transition-transform"
        aria-label="Chamar Gerente"
      >
        <Bell className="h-5 w-5" />
      </button>
    </header>
  );
}
