import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, User, MoreVertical, Eye, Trash2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PDVOrder } from "@/hooks/use-pdv-orders";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderCardProps {
  order: PDVOrder;
  itemCount: number;
  onView: (order: PDVOrder) => void;
  onClose: (id: string) => void;
  onCancel: (id: string) => void;
}

const STATUS_CONFIG = {
  aberta: { label: "Aberta", variant: "default" as const },
  fechada: { label: "Fechada", variant: "secondary" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
};

const SOURCE_CONFIG = {
  salao: { label: "Salão", icon: "🪑" },
  balcao: { label: "Balcão", icon: "" },
  delivery: { label: "Delivery", icon: "🛵" },
};

export function OrderCard({ order, itemCount, onView, onClose, onCancel }: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.aberta;
  const sourceConfig = SOURCE_CONFIG[order.source as keyof typeof SOURCE_CONFIG] || SOURCE_CONFIG.balcao;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">#{order.order_number}</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{sourceConfig.icon}</span>
              <span>{sourceConfig.label}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              {order.status === "aberta" && (
                <>
                  <DropdownMenuItem onClick={() => onClose(order.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Fechar pedido
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCancel(order.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancelar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          {order.customer_name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(parseISO(order.opened_at), "HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold mt-1">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button 
          className="w-full" 
          onClick={() => onView(order)}
          variant={order.status === "aberta" ? "default" : "outline"}
        >
          {order.status === "aberta" ? "Gerenciar" : "Ver detalhes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
