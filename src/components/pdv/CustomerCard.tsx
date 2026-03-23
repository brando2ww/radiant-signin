import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Edit, Trash2, Store, Truck } from "lucide-react";
import type { UnifiedCustomer } from "@/hooks/use-pdv-customers";

interface CustomerCardProps {
  customer: UnifiedCustomer;
  onEdit: (customer: UnifiedCustomer) => void;
  onDelete: (id: string) => void;
}

export function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const sourceLabel = customer.source === "pdv" ? "PDV" : "Delivery";
  const SourceIcon = customer.source === "pdv" ? Store : Truck;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
            <Badge variant="secondary" className="gap-1 text-xs">
              <SourceIcon className="h-3 w-3" />
              {sourceLabel}
            </Badge>
          </div>
          {customer.source === "pdv" && (
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(customer)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(customer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {customer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
        </div>

        {customer.source === "pdv" && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
            <span>
              <span className="font-medium text-foreground">
                {customer.total_spent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>{" "}
              gasto
            </span>
            <span>
              <span className="font-medium text-foreground">{customer.visit_count}</span> visitas
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
