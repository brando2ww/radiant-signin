import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Edit2, Trash2, Calendar } from "lucide-react";
import type { Bill } from "@/hooks/use-bills";
import { cn } from "@/lib/utils";

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (bill: Bill) => void;
}

export function BillCard({ bill, onEdit, onDelete, onMarkAsPaid }: BillCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = () => {
    const today = new Date();
    const dueDate = parseISO(bill.due_date);
    
    if (bill.status === "paid") {
      return <Badge className="bg-green-500">Pago</Badge>;
    }
    if (isAfter(today, dueDate)) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{bill.title}</h3>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(parseISO(bill.due_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              {bill.category && (
                <Badge variant="outline" className="text-xs">
                  {bill.category}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "text-xl font-bold",
              bill.type === "payable" ? "text-red-500" : "text-green-500"
            )}>
              {bill.type === "payable" ? "-" : "+"}{formatCurrency(bill.amount)}
            </div>

            <div className="flex items-center gap-1">
              {bill.status !== "paid" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMarkAsPaid(bill)}
                  className="text-green-500 hover:text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(bill)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(bill.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
