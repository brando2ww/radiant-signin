import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { incomeCategories, expenseCategories } from "@/data/transaction-categories";

interface StepCategoryProps {
  type: "income" | "expense";
  value: string;
  onChange: (value: string) => void;
}

export const StepCategory = ({ type, value, onChange }: StepCategoryProps) => {
  const categories = type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Qual a categoria?</h2>
        <p className="text-sm text-muted-foreground">
          Selecione a categoria da {type === "income" ? "receita" : "despesa"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = value === cat.value;
          const colorClass = type === "income" 
            ? "ring-green-500 bg-green-500/10" 
            : "ring-red-500 bg-red-500/10";
          const iconBgClass = type === "income"
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-red-100 dark:bg-red-900/30";
          const iconColorClass = type === "income"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";

          return (
            <Card
              key={cat.value}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && colorClass
              )}
              onClick={() => onChange(cat.value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-full shrink-0", iconBgClass)}>
                  <Icon className={cn("w-4 h-4", iconColorClass)} />
                </div>
                <span className="text-sm font-medium leading-tight">{cat.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
