import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StepTypeProps {
  value: "income" | "expense";
  onChange: (value: "income" | "expense") => void;
}

export const StepType = ({ value, onChange }: StepTypeProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">O que você quer registrar?</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de transação
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            value === "income" && "ring-2 ring-green-500 bg-green-500/10"
          )}
          onClick={() => onChange("income")}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Receita</h3>
              <p className="text-xs text-muted-foreground">Dinheiro que entra</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            value === "expense" && "ring-2 ring-red-500 bg-red-500/10"
          )}
          onClick={() => onChange("expense")}
        >
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold">Despesa</h3>
              <p className="text-xs text-muted-foreground">Dinheiro que sai</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
