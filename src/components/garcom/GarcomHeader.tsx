import { useAuth } from "@/contexts/AuthContext";

export function GarcomHeader({ title }: { title?: string }) {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.name?.split(" ")[0] || "Garçom";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background px-4 safe-area-top">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">
          Olá, {displayName}
        </p>
        {title && (
          <h1 className="text-base font-semibold leading-tight truncate">
            {title}
          </h1>
        )}
      </div>
    </header>
  );
}
