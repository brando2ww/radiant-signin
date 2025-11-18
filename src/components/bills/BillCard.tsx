import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Edit, MoreVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bill } from "@/hooks/use-bills";

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (bill: Bill) => void;
}

export function BillCard({ bill, onEdit, onDelete, onMarkAsPaid }: BillCardProps) {
  const isOverdue = bill.status === "pending" && isPast(parseISO(bill.due_date));

  const getStatusBadge = () => {
    if (bill.status === "paid") {
      return <Badge variant="default" className="bg-success text-success-foreground">Paga</Badge>;
    }
    if (isOverdue || bill.status === "overdue") {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    return <Badge variant="secondary">Pendente</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{bill.title}</h3>
            {getStatusBadge()}
            {bill.installments > 1 && (
              <Badge variant="outline">
                {bill.current_installment}/{bill.installments}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              Vencimento: {format(parseISO(bill.due_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {bill.category && <span>• {bill.category}</span>}
            {bill.payment_method && <span>• {bill.payment_method}</span>}
          </div>

          {bill.notes && (
            <p className="text-sm text-muted-foreground">{bill.notes}</p>
          )}

          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${bill.type === "receivable" ? "text-success" : "text-destructive"}`}>
              {formatCurrency(bill.amount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bill.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAsPaid(bill)}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Pagar
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(bill)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(bill.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
