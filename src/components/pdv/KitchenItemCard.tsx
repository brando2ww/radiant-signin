import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, ChefHat, CheckCircle2, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KitchenItemCardProps {
  item: {
    id: string;
    product_name: string;
    quantity: number;
    notes: string | null;
    kitchen_status: string;
    added_at: string;
    order: {
      order_number: string;
      source: string;
      table_id: string | null;
      customer_name: string | null;
    };
  };
  onUpdateStatus: (itemId: string, status: "preparando" | "pronto" | "entregue") => void;
}

const STATUS_CONFIG = {
  pendente: {
    label: "Pendente",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-muted-foreground",
  },
  preparando: {
    label: "Preparando",
    variant: "default" as const,
    icon: ChefHat,
    color: "text-primary",
  },
  pronto: {
    label: "Pronto",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-success",
  },
};

const SOURCE_CONFIG = {
  salao: { label: "Salão", icon: MapPin },
  balcao: { label: "Balcão", icon: User },
  delivery: { label: "Delivery", icon: MapPin },
};

export function KitchenItemCard({ item, onUpdateStatus }: KitchenItemCardProps) {
  const statusConfig = STATUS_CONFIG[item.kitchen_status as keyof typeof STATUS_CONFIG];
  const sourceConfig = SOURCE_CONFIG[item.order.source as keyof typeof SOURCE_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;
  const SourceIcon = sourceConfig?.icon || MapPin;

  const handleNextStatus = () => {
    if (item.kitchen_status === "pendente") {
      onUpdateStatus(item.id, "preparando");
    } else if (item.kitchen_status === "preparando") {
      onUpdateStatus(item.id, "pronto");
    }
  };

  const getActionButton = () => {
    if (item.kitchen_status === "pendente") {
      return (
        <Button onClick={handleNextStatus} size="sm" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Iniciar Preparo
        </Button>
      );
    } else if (item.kitchen_status === "preparando") {
      return (
        <Button onClick={handleNextStatus} size="sm" className="w-full">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Marcar Pronto
        </Button>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">#{item.order.order_number}</span>
              <Badge variant="outline" className="gap-1">
                <SourceIcon className="h-3 w-3" />
                {sourceConfig?.label}
              </Badge>
            </div>
            {item.order.customer_name && (
              <p className="text-sm text-muted-foreground">
                {item.order.customer_name}
              </p>
            )}
          </div>
          <Badge variant={statusConfig?.variant || "secondary"} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig?.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{item.quantity}x</span>
            <span className="text-lg font-medium">{item.product_name}</span>
          </div>

          {item.notes && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">
                Observações:
              </p>
              <p className="text-sm mt-1">{item.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(item.added_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </div>

        {getActionButton()}
      </CardContent>
    </Card>
  );
}
