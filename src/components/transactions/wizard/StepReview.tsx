import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Calendar, CreditCard, Repeat } from "lucide-react";
import { getCategoryLabel, getCategoryIcon, paymentMethods } from "@/data/transaction-categories";

interface StepReviewProps {
  type: "income" | "expense";
  category: string;
  amount: number | string;
  date: Date;
  description: string;
  paymentMethod: string;
  isRecurring: boolean;
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
};

export const StepReview = ({
  type,
  category,
  amount,
  date,
  description,
  paymentMethod,
  isRecurring,
}: StepReviewProps) => {
  const CategoryIcon = getCategoryIcon(category, type);
  const categoryLabel = getCategoryLabel(category, type);
  const paymentLabel = paymentMethods.find((m) => m.value === paymentMethod)?.label || "Não informado";

  const isIncome = type === "income";
  const colorClass = isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const bgClass = isIncome 
    ? "bg-green-100 dark:bg-green-900/30" 
    : "bg-red-100 dark:bg-red-900/30";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Confirme sua transação</h2>
        <p className="text-sm text-muted-foreground">
          Revise os dados antes de salvar
        </p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-5 space-y-4">
          {/* Header com ícone e valor */}
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-full", bgClass)}>
              {isIncome ? (
                <TrendingUp className={cn("w-6 h-6", colorClass)} />
              ) : (
                <TrendingDown className={cn("w-6 h-6", colorClass)} />
              )}
            </div>
            <div className="flex-1">
              <p className={cn("font-bold text-2xl", colorClass)}>
                {isIncome ? "+" : "-"} {formatCurrency(amount)}
              </p>
              <p className="text-sm text-muted-foreground">{categoryLabel}</p>
            </div>
          </div>

          {description && (
            <>
              <Separator />
              <p className="text-sm">{description}</p>
            </>
          )}

          <Separator />

          {/* Detalhes em grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="font-medium">
                  {format(date, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Pagamento</p>
                <p className="font-medium">{paymentLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CategoryIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Categoria</p>
                <p className="font-medium">{categoryLabel}</p>
              </div>
            </div>

            {isRecurring && (
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-muted-foreground text-xs">Recorrência</p>
                  <p className="font-medium text-primary">Mensal</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
