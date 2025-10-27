import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, DollarSign } from "lucide-react";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: PDVTable;
  orderTotal?: number;
  orderTime?: string;
  onClick: (table: PDVTable) => void;
}

const STATUS_CONFIG = {
  livre: {
    label: "Livre",
    variant: "secondary" as const,
    className: "bg-muted hover:bg-muted/80 border-2",
  },
  ocupada: {
    label: "Ocupada",
    variant: "destructive" as const,
    className: "bg-destructive/10 hover:bg-destructive/20 border-2 border-destructive",
  },
  aguardando_pedido: {
    label: "Aguardando",
    variant: "default" as const,
    className: "bg-primary/10 hover:bg-primary/20 border-2 border-primary",
  },
  aguardando_cozinha: {
    label: "Na Cozinha",
    variant: "secondary" as const,
    className: "bg-yellow-500/10 hover:bg-yellow-500/20 border-2 border-yellow-500",
  },
  pediu_conta: {
    label: "Pediu Conta",
    variant: "default" as const,
    className: "bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500",
  },
  pendente_pagamento: {
    label: "Pagamento",
    variant: "secondary" as const,
    className: "bg-purple-500/10 hover:bg-purple-500/20 border-2 border-purple-500",
  },
};

export function TableCard({ table, orderTotal, orderTime, onClick }: TableCardProps) {
  const statusConfig = STATUS_CONFIG[table.status] || STATUS_CONFIG.livre;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        statusConfig.className
      )}
      onClick={() => onClick(table)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">Mesa {table.table_number}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Users className="h-3 w-3" />
                <span>{table.capacity} lugares</span>
              </div>
            </div>
            <Badge variant={statusConfig.variant} className="text-xs">
              {statusConfig.label}
            </Badge>
          </div>

          {table.status !== "livre" && (
            <div className="space-y-2 pt-2 border-t">
              {orderTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {orderTime}
                  </span>
                </div>
              )}
              {orderTotal !== undefined && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  <span>R$ {orderTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
