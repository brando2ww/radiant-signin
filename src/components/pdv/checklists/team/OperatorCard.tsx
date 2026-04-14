import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import type { Database } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];

const ACCESS_LABELS: Record<string, string> = {
  operador: "Operador",
  lider: "Líder",
  gestor: "Gestor",
};

const ACCESS_COLORS: Record<string, string> = {
  operador: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  lider: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  gestor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  operator: OperatorRow;
  onClick: () => void;
}

export function OperatorCard({ operator: op, onClick }: Props) {
  const avatarColor = (op as any).avatar_color || "#6366f1";

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${!op.is_active ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      <CardContent className="py-5 px-5">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(op.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{op.name}</h3>
              {!op.is_active && (
                <Badge variant="outline" className="text-[10px] border-destructive text-destructive">
                  Inativo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{op.role}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {SECTOR_LABELS[op.sector as ChecklistSector] || op.sector}
              </Badge>
              <Badge className={`text-[10px] border-0 ${ACCESS_COLORS[op.access_level] || ""}`}>
                {ACCESS_LABELS[op.access_level] || op.access_level}
              </Badge>
            </div>
            {op.last_access_at && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Último acesso:{" "}
                {formatDistanceToNow(new Date(op.last_access_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
