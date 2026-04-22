import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Clock, 
  Plus, 
  Eye,
  MoreVertical 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { cn } from "@/lib/utils";
import { deferMenuAction } from "@/lib/ui/defer-menu-action";

interface ComandaCardProps {
  comanda: Comanda;
  items: ComandaItem[];
  onView: (comanda: Comanda) => void;
  onAddItem: (comanda: Comanda) => void;
  onClose?: (comanda: Comanda) => void;
  onCancel?: (comanda: Comanda) => void;
}

const STATUS_CONFIG = {
  aberta: {
    label: "Aberta",
    variant: "default" as const,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  fechada: {
    label: "Fechada",
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground",
  },
  cancelada: {
    label: "Cancelada",
    variant: "destructive" as const,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function ComandaCard({
  comanda,
  items,
  onView,
  onAddItem,
  onClose,
  onCancel,
}: ComandaCardProps) {
  const config = STATUS_CONFIG[comanda.status];
  const itemCount = items.length;
  const isOpen = comanda.status === "aberta";

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      !isOpen && "opacity-60"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                #{comanda.comanda_number}
              </span>
              <Badge className={config.className} variant={config.variant}>
                {config.label}
              </Badge>
            </div>
            {comanda.customer_name && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{comanda.customer_name}</span>
                {comanda.person_number && (
                  <span className="text-xs">(Pessoa {comanda.person_number})</span>
                )}
              </div>
            )}
          </div>
          
          {isOpen && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deferMenuAction(() => onView(comanda))}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deferMenuAction(() => onAddItem(comanda))}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar item
                </DropdownMenuItem>
                {onClose && (
                  <DropdownMenuItem onClick={() => deferMenuAction(() => onClose(comanda))}>
                    Fechar comanda
                  </DropdownMenuItem>
                )}
                {onCancel && (
                  <DropdownMenuItem 
                    onClick={() => deferMenuAction(() => onCancel(comanda))}
                    className="text-destructive"
                  >
                    Cancelar comanda
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(comanda.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold">
              R$ {comanda.subtotal.toFixed(2)}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView(comanda)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onAddItem(comanda)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
